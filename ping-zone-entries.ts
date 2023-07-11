import {parseZone, DnsRecord} from "npm:dnsz";
const decoder = new TextDecoder("utf-8");

// read zone-file and form a list of DNS requests.
const ping = async (record:DnsRecord, protocol: string = 'http') => {
    const ip = record.content;
    console.log('fetching ' + record.name + " " + record.content)
    try {
        const c = new AbortController();
        //timeout after 10 sec
        const id = setTimeout(() => c.abort(), 10000);

        const result = await fetch(`${protocol}://${ip}`, {signal: c.signal, headers: {"Host": record.name}})
        clearTimeout(id);
        console.log(result.status)
    } catch (err) {
        console.log(`cannot connect to ${record.name} ${protocol}://${ip}`)
    }
    
    
    
}


try{
    const zoneFile = Deno.readFileSync(Deno.args[0]);
    const zone = parseZone(decoder.decode(zoneFile));
    for(const entry of zone.records){
        if (entry.type == "A") {
           // console.log(entry)
            ping(entry)
            ping(entry, "https")
        }
        
    }
}
catch(err){
    console.error("Error resolving ZONE-file: ",err.message);
    Deno.exit(1);
}

