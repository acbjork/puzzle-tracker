class DateHelpers {
  constructor() {
    console.log('📅 Date Helpers initialized');
  }
  getToday() {
    return new Date().toISOString().slice(0, 10);
  }
  getCurrentTimestamp() {
    return new Date().toISOString();
  }
}
const dateHelpers = new DateHelpers();
export default dateHelpers;
export { DateHelpers };