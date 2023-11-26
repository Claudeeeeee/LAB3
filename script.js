document.addEventListener('DOMContentLoaded', function () {
  var center = [39.4, -78];
  var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  var osm = L.tileLayer(osmUrl, {
    maxZoom: 18,
    attribution: osmAttrib
  });

  var map = L.map('map', {
    layers: [osm],
    center: new L.LatLng(center[0], center[1]),
    zoom: 7
  });

  var hexLayer = L.geoJson().addTo(map);

  function generateData() {
    var data = {
      type: 'FeatureCollection',
      features: []
    };

    for (var i = 0; i < 1000; i++) {
      data.features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [center[1] + Math.random(), center[0] + Math.random()]
        }
      });
    }

    hexLayer.clearLayers();
    hexLayer.addData(data);
  }

  generateData();

  function generateImage() {
    leafletImage(map, function (err, canvas) {
      if (err) {
        console.error('Error capturing map image:', err);
        return;
      }

      var imgURL = canvas.toDataURL();

      var img = document.createElement('img');
      img.src = imgURL;

      var containerDiv = document.createElement('div');
      containerDiv.appendChild(img);

      document.getElementById('images').appendChild(containerDiv);
    });
  }

  function getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        var currentLocation = [position.coords.latitude, position.coords.longitude];
        map.setView(currentLocation, 15);
        generateImage();
      }, function (error) {
        console.error('Error getting current location:', error.message);
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  var imagesDiv = document.getElementById('images');

  function generatePuzzle() {
    leafletImage(map, function (err, canvas) {
      var img = document.createElement('img');
      var dimensions = map.getSize();
      img.width = dimensions.x;
      img.height = dimensions.y;
      img.src = canvas.toDataURL();
      document.getElementById('images').innerHTML = '';

      var puzzlePieces = createShuffledPuzzle(img, 4, 4);
      var containerDiv = document.createElement('div');
      containerDiv.id = 'puzzle-container';

      puzzlePieces.forEach(function (piece) {
        containerDiv.appendChild(piece);
      });

      imagesDiv.appendChild(containerDiv);

      // Ustawienie obsługi przeciągania puzzli
      makePuzzlePiecesDraggable(puzzlePieces);
    });
  }

  function createShuffledPuzzle(img, rows, cols) {
    var puzzlePieces = [];
    var pieceWidth = img.width / cols;
    var pieceHeight = img.height / rows;

    for (var row = 0; row < rows; row++) {
      for (var col = 0; col < cols; col++) {
        var puzzlePieceDiv = document.createElement('div');
        puzzlePieceDiv.className = 'puzzle-piece';
        puzzlePieceDiv.style.backgroundImage = 'url(' + img.src + ')';
        puzzlePieceDiv.style.backgroundSize = (cols * 100) + '% ' + (rows * 100) + '%';
        puzzlePieceDiv.style.backgroundPosition = (-col * 100) + '% ' + (-row * 100) + '%';
        puzzlePieceDiv.dataset.order = row * cols + col;

        puzzlePieces.push(puzzlePieceDiv);
      }
    }

    // Mieszanie puzzli
    puzzlePieces.sort(() => Math.random() - 0.5);

    return puzzlePieces;
  }

  function makePuzzlePiecesDraggable(puzzlePieces) {
    puzzlePieces.forEach(function (piece) {
      piece.draggable = true;

      piece.addEventListener('dragstart', function (e) {
        e.dataTransfer.setData('text/plain', piece.dataset.order);
      });

      piece.addEventListener('dragover', function (e) {
        e.preventDefault();
      });

      piece.addEventListener('drop', function (e) {
        e.preventDefault();
        var sourceOrder = e.dataTransfer.getData('text/plain');
        var targetOrder = piece.dataset.order;

        // Zamień miejscami puzzle
        var sourcePiece = document.querySelector('.puzzle-piece[data-order="' + sourceOrder + '"]');
        var targetPiece = document.querySelector('.puzzle-piece[data-order="' + targetOrder + '"]');

        if (sourcePiece && targetPiece && sourcePiece !== targetPiece) {
          // Zamień miejsca
          var sourceIndex = Array.from(sourcePiece.parentNode.children).indexOf(sourcePiece);
          var targetIndex = Array.from(targetPiece.parentNode.children).indexOf(targetPiece);

          sourcePiece.parentNode.insertBefore(sourcePiece, targetPiece);
          targetPiece.parentNode.insertBefore(targetPiece, sourcePiece);

          // Aktualizuj dataset order
          sourcePiece.dataset.order = targetOrder;
          targetPiece.dataset.order = sourceOrder;

          // Sprawdź ułożenie puzzli
          checkPuzzleOrder();
        }
      });
    });
  }

  function checkPuzzleOrder() {
    var puzzlePieces = document.querySelectorAll('.puzzle-piece');
    var correctOrder = Array.from(puzzlePieces).every(function (piece, index) {
      return parseInt(piece.dataset.order) === index;
    });

    if (correctOrder) {
      alert('Puzzle ułożone poprawnie!');
    }
  }

  document.querySelector('button#mapBtn').addEventListener('click', generateImage);
  document.querySelector('button#getCurrentLocation').addEventListener('click', getCurrentLocation);
  document.querySelector('button#generatePuzzle').addEventListener('click', generatePuzzle);
});
