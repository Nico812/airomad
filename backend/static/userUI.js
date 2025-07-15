// Funzioni di creazione HTML
var data = {};
// Funzione per generare l'HTML dell'utente

function generateUserUI_HTML2(data_, parentKey = '') {
    let html = '<ul>';
    // Itera attraverso i dati dell'oggetto
    for (const [key, value] of Object.entries(data_)) {
        // Se il valore è un oggetto, ricorsivamente genera una lista annidata
        if (typeof value === 'object' && key !== 'units') {
            // Se l'oggetto ha un parentKey, concatenalo con il key attuale
            const newParentKey = parentKey ? `${parentKey}.${key}` : key;
            html += `<li class="list-item">${key}: ${generateUserUI_HTML2(value, newParentKey)}</li>`;
        } else if (key === 'level') {
            // Se la chiave è 'level', aggiungi un pulsante "Upgrade"
            html += `<li class="list-item" data-attribute="${parentKey}">
                        ${key}: ${value} 
                        <button class="upgrade-button" data-attribute="${parentKey}">Upgrade</button>
                    </li>`;
        } else if (key === 'units' && typeof value === 'object') {
            // Se la chiave è 'units' e il valore è un oggetto, aggiungi un pulsante "Train" e visualizza le unità
            html += `<li class="list-item" data-attribute="${parentKey}">
                        units: 
                        <ul>`;
            // Itera attraverso le unità e i relativi valori
            for (const [unitType, unitValue] of Object.entries(value)) {
                html += `<li>${unitType}: ${unitValue}</li>`;
            }
            html += `   </ul>
                        <button class="train-button" data-attribute="${parentKey}">Train</button>
                    </li>`;
        } else {
            // Altrimenti, aggiungi il valore come attributo dell'elemento della lista
            html += `<li class="list-item" data-${key}="${value}">${key}: ${value}</li>`;
        }
    }
    html += '</ul>';
    return html;
}

function generateUserUI_HTML(data_, parentKey = '') {
    data = data_;
    let html = generateUserUI_HTML2(data_, parentKey = '');
    return html;
}


function generateMapHTML(map) {
  let html = '<div class="map">';
  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      const tile = map[i][j].tile;
      const coord = `(${map[i][j].coord.x},${map[i][j].coord.y})`; // Prendi le coordinate dalla mappa

      if (map[i][j].castle !== null) {
        const castle = map[i][j].castle;
        html += `<div class="tile" style="background-color: ${castle.color};" data-id="${castle.id}" data-name="${castle.name}" data-coord="${coord}"></div>`;
      } else {
        const units = map[i][j].units;
        let unitsHTML = '';
        if (units.length > 0) {
          units.forEach(unit => {
            // Aggiungi un div per ogni unità dentro il div della cella e applica uno stile CSS per posizionarle
            unitsHTML += `<div class="tile" style="background-color: red;" data-id="${unit}"></div>`;
          });
        }
        html += `<div class="tile" style="background-color: ${tile.color};" data-id="${tile.id}" data-name="${tile.name}" data-coord="${coord}">${unitsHTML}</div>`; // Aggiungi le unità alla cella
      }
    }
  }
  html += '</div>';
  return html;
}

// Gestore di eventi: click

// Funzione per gestire gli eventi click
document.getElementById('list-container').addEventListener('click', function(event) {
    if (event.target.classList.contains('upgrade-button')) {
        console.log(event.target.dataset.attribute);
        socket.emit('upgrade request', event.target.dataset.attribute);
    };

    if (event.target.classList.contains('train-button')) {
        const unitTypes = Object.keys(data.units);
        const unitsToTrain = {};
        
        unitTypes.forEach(unitType => {
            const input = prompt(`Quanti ${unitType} vuoi trainare?`);
            if (input !== null) {
                const numUnits = parseInt(input);
                if (!isNaN(numUnits)) {
                    unitsToTrain[unitType] = numUnits;
                }
            }
        });
        
        console.log(unitsToTrain); // Puoi fare qui qualcosa con l'input dell'utente
        socket.emit("training request", unitsToTrain);
    }
});


document.getElementById('map-container').addEventListener('click', function(event) {
    // Verifica se l'elemento cliccato è un tile
    if (event.target.classList.contains('tile')) {
        const tileId = event.target.dataset.id;
        const tileName = event.target.dataset.name;
        const tileCoord = event.target.dataset.coord;

        // Mostra gli attributi del tile sopra la mappa
        const tileInfo = document.getElementById('tile-info');
        tileInfo.innerHTML = `ID: ${tileId}<br>Name: ${tileName}<br>Coord: ${tileCoord}`;

        // Verifica se il tile è un castello (id = 0)
        if (tileId === '0') {

            // Aggiungi un pulsante per attaccare il castello
            const attackButton = document.createElement('button');
            attackButton.textContent = 'Attacca il castello';

        // Se si vuole attaccare
        attackButton.addEventListener('click', function() {
            const troopsInput = prompt(`Specifica il numero di knights, paesants e mages che vuoi utilizzare per attaccare il castello "${tileName}" (formato: knights, paesants, mages):`);
            
            if (troopsInput) {
                const [knightsNumber, peasantsNumber, magesNumber] = troopsInput.split(',').map(Number);
        
                if (!isNaN(knightsNumber) && knightsNumber >= 0 && knightsNumber <= myCastle.units.knights &&
                    !isNaN(peasantsNumber) && peasantsNumber >= 0 && paesantsNumber <= myCastle.units.peasants &&
                    !isNaN(magesNumber) && magesNumber >= 0 && magesNumber <= myCastle.units.mages) {
        
                    socket.emit('new attack', {
                        knights: knightsNumber,
                        peasants: peasantsNumber,
                        mages: magesNumber
                    }, tileName);
                } else {
                    console.log('Inserisci un numero valido di knights, paesants e mages, e assicurati che siano disponibili nel tuo castello.');
                }
            }
        
            tileInfo.style.display = 'none';
        });
            tileInfo.appendChild(attackButton);
        }
        tileInfo.style.display = 'block';
}});

// Castle info display toggle off
document.addEventListener('click', function(event) {
    if (!event.target.classList.contains('tile')) {
        document.getElementById('tile-info').style.display = 'none';
    }
});




