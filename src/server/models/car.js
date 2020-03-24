schema({
  images: url,
  carNumber: string,
  carModel: string,
  color: {required: false, types: string, validation: (color) => {// do something}}
  currentStatus: string, // v garasze...v poezdke... v pogruzke
  probeg: number,
  tehproverki: [{status: Boolean, date: Date}],
  remonti: [{price: number, date: Date}],
  unpredictableSituations: [ObjectId]
})
