import {parseZone} from "npm:dnsz";
const decoder = new TextDecoder("utf-8");

// read zone-file and form a list of DNS requests.
let entryList:string[] = [];
try{
    const zoneFile = Deno.readFileSync(Deno.args[2]);
    const zone = parseZone(decoder.decode(zoneFile));
    for(let entry of zone.records){
        if(entry.type === "SOA" || entry.type === "NS"){
            continue;
        }
        let data = JSON.stringify({type:entry.type,name:entry.name});
        if(!entryList.includes(data)){
            entryList.push(data);
        }
    }
}
catch(err){
    console.error("Error resolving ZONE-file: ",err.message);
    Deno.exit(1);
}

// resolve nameserver IPs
const ns1Name = Deno.args[0];
const ns2Name = Deno.args[1];
let ns1Ip=ns1Name,ns2Ip=ns2Name;
try{
    if(!Number(ns1Name.split(".").join(""))){
        ns1Ip = (await Deno.resolveDns(ns1Name, "A"))[0];
    }
    if(!Number(ns2Name.split(".").join(""))){
        ns2Ip = (await Deno.resolveDns(ns2Name, "A"))[0];
    }
}
catch(err){
    console.error("Invalid nameserver: ",err.message);
    Deno.exit(1);
}

// compare DNS
for(let stringEntry of entryList){
    let entry = JSON.parse(stringEntry);
    let record1,record2;

    // first NS
    try{
        record1 = await Deno.resolveDns(entry.name, entry.type, {
            nameServer: { ipAddr: ns1Ip },
        });
        record1 = JSON.stringify(record1.sort());
    }
    catch(err){
        record1 = err.message;
    }
    // second NS
    try{
        record2 = await Deno.resolveDns(entry.name, entry.type, {
            nameServer: { ipAddr: ns2Ip },
        });
        record2 = JSON.stringify(record2.sort());
    }
    catch(err){
        record2 = err.message;
    }

    // check
    if(record1 != record2){
        console.log("%c"+entry.type+" "+entry.name,"font-weight: bold");
        console.log(ns1Name,"\t",record1);
        console.log(ns2Name,"\t",record2,"\n");
    }
    

}
