import {parseZone, DnsRecord} from "npm:dnsz";

import { writeCSV } from 'https://deno.land/x/flat/mod.ts'

const decoder = new TextDecoder("utf-8");

// read zone-file and form a list of DNS requests.

try{
    const csvRows = []
    const zoneFile = Deno.readFileSync(Deno.args[0]);
    const zone = parseZone(decoder.decode(zoneFile));
    for(const entry of zone.records){
        if (entry.type == "A" || entry.type == "CNAME") {
            csvRows.push(entry)
        }
        
        
        
        
    }
    writeCSV('./zone.csv', csvRows)
}
catch(err){
    console.error("Error resolving ZONE-file: ",err.message);
    Deno.exit(1);
}

