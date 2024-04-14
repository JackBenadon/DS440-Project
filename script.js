
var data = []

const loadData = async () => {
    data = await fetch('data.csv').then(r => r.text()) 
    data = data.split('\n')
    
    data = data.slice(1, data.length - 1)

    console.log(data[0])
}
loadData()

function changePage(url) {
    window.location.replace(url)
}

function showSuggestions() {
    var input = document.getElementById("searchInput").value.toLowerCase();
    var suggestionsDiv = document.getElementById("suggestions");
    suggestionsDiv.innerHTML = "";

    if (input.length === 0) {
        suggestionsDiv.innerHTML = "";
        return;
    }

    var matches = data.filter(function(item) {
        return item.toLowerCase().startsWith(input);
    });

    matches.forEach(function(match) {
        var suggestion = document.createElement("div");
        suggestion.textContent = match.split(",")[0].replace(/"/g, '');;

        suggestion.onclick = function() {
            var selectedValue = match
            document.getElementById("searchInput").value = match;
            suggestionsDiv.innerHTML = "";
            window.location.href = "/player.html?title=" + encodeURIComponent(selectedValue); // Redirecting to player.html

        };
        suggestionsDiv.appendChild(suggestion);
    });
}
