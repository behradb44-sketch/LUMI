export const OBJECTIVES=Array.from({length:100},(_,i)=>{const themes=[
["Wake the Lumi Core","Find the ancient energy chamber and activate its three relays."],
["Forest Signal","Reach the forest beacon and synchronize the signal."],
["Lost Supplies","Collect scattered supply crates before the storm arrives."],
["River Rescue","Help the stranded explorer cross the river."],
["Star Fragment","Discover a glowing fragment hidden beyond the old ruins."],
["Garden of Wind","Activate the wind flowers around the meadow."],
["The First Spark","Gather energy shards and restore the village lantern."],
["Glitch Trail","Follow the unstable trail and stabilize three portals."],
["Beach Beacon","Repair the coastal beacon before the tide turns."],
["Snowbound","Restore warmth to the frozen outpost."]
];const t=themes[i%themes.length];return{id:`L${String(i+1).padStart(3,"0")}`,name:`${t[0]} ${Math.floor(i/themes.length)+1}`,desc:t[1],stages:3+(i%3),requiredItems:["Lumi Shard","Ancient Gear"].slice(0,1+i%2),requiredActions:["interact","explore"],npcState:"active",spawnRules:{region:i%8},completion:"all stages complete",progress:0}});