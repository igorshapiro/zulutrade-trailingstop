console.log("Zulu trade trailing stops extension activated");
console.log(document);

chrome.extension.onMessage.addListener(
  function(message, sender, sendResponse) {
    console.log("Message received");
    console.log("ZTTS: " + message.type);
  }
);

function createPositionFromElement(el) {
  var tradeRow = el.parentNode;
  var pair = tradeRow.querySelector("td:nth-child(2)").innerText;
  var operation = tradeRow.querySelector("td:nth-child(3)").innerText;
  var entry = tradeRow.querySelector("td:nth-child(6)").innerText;
  var matches = el.innerText.match(/(-?\d+\.?\d*)\ pips\s*(-?(.)\d+\.?\d*)/);
  var positionId = pair + "-" + operation + "-" + entry;
  var pips = parseFloat(matches[1]);
  return {
    pips: pips,
    profit: matches[2],
    currency: matches[3],
    operation: operation,
    entry: entry,
    pair: pair,
    id: positionId,
    max_pips: pips
  };
}

function findPositionById(id) {
  if (positions.length == 0) return null;
  for (var index = 0; index < positions.length; index++) {
    var p = positions[index];
    if (p.id == id) {
      return p;
    }
  }
  return null;
}

var positions = []

function pollPage() {
  var elements = document.querySelectorAll("tr.trade td:nth-child(10)");
  // console.log(elements.length);
  if (elements.length > 0) {
    for (var index = 0; index < elements.length; index++) {
      var el = elements[index];
      var position = createPositionFromElement(el);
      var existingPosition = findPositionById(position.id);
      if (existingPosition) {
        if (position.pips > existingPosition.max_pips) {
          console.log("Position " + position.id + " max value changed");
          existingPosition.max_pips = position.pips;
          existingPosition.pips = position.pips;
        }
      }
      else {
        positions.push(position);
      }
    }
  }
  setTimeout(pollPage, 3000);
}

pollPage();

// alert("hey!");