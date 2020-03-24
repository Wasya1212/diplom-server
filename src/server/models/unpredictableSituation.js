{
  routeId: { required: true, type: Types.ObjectId },
  description: { required: true, type: Types.String },
  photos: [ Types.Url ],
  location: { lat: Types.Number, lng: Types.Number }
}
