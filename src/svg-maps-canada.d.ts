declare module '@svg-maps/canada' {
  interface CanadaLocation {
    id: string
    name: string
    path: string
  }

  interface CanadaMap {
    label: string
    viewBox: string
    locations: CanadaLocation[]
  }

  const map: CanadaMap
  export default map
}
