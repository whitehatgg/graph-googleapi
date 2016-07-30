export class Places {
  constructor({ connector }) {
    this.connector = connector;
  }

  getDetailsByPlaceid(placeId) {
    return this.connector.get('maps/api/place/details/json?placeid=' + placeId);
  }
}