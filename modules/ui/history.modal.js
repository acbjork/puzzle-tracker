class HistoryModal {
  constructor() {
    this.isVisible = false;
  }
  
  init() {
    return true;
  }
  
  showModal() {
    return true;
  }
  
  hideModal() {
    return true;
  }
  
  updateInterfaceVisibility() {
    return true;
  }
  
  isModalVisible() {
    return this.isVisible;
  }
}

const historyModal = new HistoryModal();

export default historyModal;
export { HistoryModal };