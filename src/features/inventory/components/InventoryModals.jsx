// Katalog
import {
  CategoryModal,
  DeleteItemModal,
  ItemModal,
  LocationModal,
} from "./CatalogModals";

// Xatlov
import {
  AddStockModal,
  EditStockModal,
  RepairModal,
  TransferModal,
  WriteOffModal,
} from "./StockModals";

// Kunlik monitoring
import { OpenCheckModal } from "./CheckModals";

// Zarar va undiruv
import {
  CancelChargeModal,
  CancelDamageModal,
  ChargeModal,
  DamageModal,
  DamagePaymentModal,
  VoidDamagePaymentModal,
  WaiveDamageModal,
} from "./DamageModals";

/**
 * Bo'limning BARCHA modallari bitta joyda mount qilinadi.
 *
 * Modal holati Context'da yashaydi, ya'ni `openModal("...")` istalgan
 * sahifadan chaqirilishi mumkin. Har bir sahifa o'z modallarini alohida
 * mount qilsa, tab almashganda ochiq modal yo'qolib qolardi.
 */
const InventoryModals = () => (
  <>
    {/* Katalog */}
    <CategoryModal />
    <ItemModal />
    <DeleteItemModal />
    <LocationModal />

    {/* Xatlov */}
    <AddStockModal />
    <RepairModal />
    <WriteOffModal />
    <EditStockModal />
    <TransferModal />

    {/* Kunlik monitoring */}
    <OpenCheckModal />

    {/* Zarar va undiruv */}
    <DamageModal />
    <ChargeModal />
    <WaiveDamageModal />
    <CancelDamageModal />
    <CancelChargeModal />
    <DamagePaymentModal />
    <VoidDamagePaymentModal />
  </>
);

export default InventoryModals;
