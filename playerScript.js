window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const title = urlParams.get('title');
    if (title) {
        const playerName = title.split(",")[0].replace(/"/g, ''); // Extract the player's name
        document.getElementById("pageTitle").innerText = "" + playerName;
        
        //General Stats
        const nation = title.split(",")[1].replace(/"/g, ''); //Extract Nationality
        document.getElementById("nation").innerText = "Nation: " + nation;
        const position = title.split(",")[2].replace(/"/g, ''); 
        document.getElementById("position").innerText = "Position: " + position;
        const team = title.split(",")[3].replace(/"/g, ''); 
        document.getElementById("team").innerText = "Team: " + team;
        const age = title.split(",")[4].replace(/"/g, ''); 
        document.getElementById("age").innerText = "Age: " + age;

        //Attacking stats
        const goals = title.split(",")[5].replace(/"/g, ''); 
        document.getElementById("goals").innerText = "Goals: " + goals;
        const assists = title.split(",")[6].replace(/"/g, ''); 
        document.getElementById("assists").innerText = "Assists: " + assists;
        const xG = title.split(",")[10].replace(/"/g, ''); 
        document.getElementById("xG").innerText = "Expected Goals: " + xG;
        const SoT = title.split(",")[14].replace(/"/g, ''); 
        document.getElementById("SoT").innerText = "Shots on Target (per 90): " + SoT;
        
        //Defensive stats
        const tackles = title.split(",")[11].replace(/"/g, ''); 
        document.getElementById("tackles").innerText = "Tackles: " + tackles;
        const interceptions = title.split(",")[12].replace(/"/g, ''); 
        document.getElementById("interceptions").innerText = "Interceptions: " + interceptions;
        const blocks = title.split(",")[13].replace(/"/g, ''); 
        document.getElementById("blocks").innerText = "Blocks: " + blocks;
        const PPC = title.split(",")[15].replace(/"/g, ''); 
        document.getElementById("PPC").innerText = "Pass Completion Percentage: " + PPC;

        //Misc stats
        const matches = title.split(",")[7].replace(/"/g, ''); 
        document.getElementById("matches").innerText = "Matches: " + matches;
        const yellowCards = title.split(",")[8].replace(/"/g, ''); 
        document.getElementById("yellowCards").innerText = "Yellow Cards: " + yellowCards;
        const redCards = title.split(",")[9].replace(/"/g, ''); 
        document.getElementById("redCards").innerText = "Red Cards: " + redCards;

        //Market Value Info
        const transferMarkt = title.split(",")[16].replace(/"/g, ''); 
        document.getElementById("transferMarkt").innerText = "TransferMarkt's Value: " + transferMarkt + " euros";
        const predictedValue = title.split(",")[17].replace(/"/g, ''); 
        document.getElementById("predictedValue").innerText = "Our Value: " + predictedValue + " euros";
    }

}

const loadData = async () => {
    data = await fetch('data.csv').then(r => r.text())
    data = data.split('\n')
    
    data = data.slice(1, data.length - 1)

    i = 1
    console.log(data[i])
}
loadData()

