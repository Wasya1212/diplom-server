// Радиус земли
const EARTH_RADIUS: number =  6372795

/*
* Расстояние между двумя точками
* $φA, $λA - широта, долгота 1-й точки,
* $φB, $λB - широта, долгота 2-й точки
* Написано по мотивам http://gis-lab.info/qa/great-circles.html
* Михаил Кобзарев <mikhail@kobzarev.com>
*
*/

interface Coordinates {
  lat: number,
  lng: number
}

export function parseToCoordsArray(coord: Coordinates): number[] {
  return [ coord.lat, coord.lng ];
}

export function parseToCoordsObject(coord: number[]): Coordinates {
  return {
    lat: coord[0],
    lng: coord[1]
  }
}

export function calculateDistance(fcoord: Coordinates, lcoord: Coordinates): number {
  // перевести координаты в радианы
  let lat1 = fcoord.lat * Math.PI / 180;
  let lat2 = lcoord.lat * Math.PI / 180;
  let long1 = fcoord.lng * Math.PI / 180;
  let long2 = lcoord.lng * Math.PI / 180;

  // косинусы и синусы широт и разницы долгот
  let cl1 = Math.cos(lat1);
  let cl2 = Math.cos(lat2);
  let sl1 = Math.sin(lat1);
  let sl2 = Math.sin(lat2);
  let delta = long2 - long1;
  let cdelta = Math.cos(delta);
  let sdelta = Math.sin(delta);

  // вычисления длины большого круга
  let y = Math.sqrt(Math.pow(cl2 * sdelta, 2) + Math.pow(cl1 * sl2 - sl1 * cl2 * cdelta, 2));
  let x = sl1 * sl2 + cl1 * cl2 * cdelta;

  //
  let ad = Math.atan2(y, x);
  let dist = ad * EARTH_RADIUS;

  return dist;
}
