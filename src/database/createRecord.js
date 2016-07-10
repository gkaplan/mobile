import { generateUUID } from '../database';
import { formatDateAndTime } from '../utilities';

/**
 * Creates a record of the given type, taking care of linking
 * up everything that might need linking up, generating IDs, serial
 * numbers, current dates, and inserting sensible defaults.
 * @param  {Realm}  database App wide local database
 * @param  {string} type     The type of record to create (not 1:1 with schema types)
 * @param  {args}   ...args  Any specific arguments the record type will need
 * @return {object}          The created database record, all ready to use
 */
export function createRecord(database, type, ...args) {
  switch (type) {
    case 'CustomerInvoice':
      return createCustomerInvoice(database, ...args);
    case 'Requisition':
      return createRequisition(database, ...args);
    case 'RequisitionItem':
      return createRequisitionItem(database, ...args);
    case 'Stocktake':
      return createStocktake(database, ...args);
    case 'StocktakeItem':
      return createStocktakeItem(database, ...args);
    case 'TransactionItem':
      return createTransactionItem(database, ...args);
    case 'TransactionBatch':
      return createTransactionBatch(database, ...args);
    default:
      throw new Error('Cannot create an unsupported record type');
  }
}

// Creates a customer invoice (Transaction) and adds it to the customer (Name)
function createCustomerInvoice(database, customer) {
  const invoice = database.create('Transaction', {
    id: generateUUID(),
    serialNumber: '1',
    entryDate: new Date(),
    confirmDate: new Date(), // Customer invoices always confirmed in mobile for easy stock tracking
    type: 'customer_invoice',
    status: 'confirmed', // Customer invoices always confirmed in mobile for easy stock tracking
    comment: '',
    otherParty: customer,
  });
  if (customer.useMasterList) invoice.addItemsFromMasterList(database);
  database.save('Transaction', invoice);
  customer.addTransaction(invoice);
  database.save('Name', customer);
  return invoice;
}

// Creates a TransactionItem and adds it to the Transaction
function createTransactionItem(database, transaction, item) {
  const transactionItem = database.create('TransactionItem', {
    id: generateUUID(),
    item: item,
    transaction: transaction,
  });
  transaction.addItem(transactionItem);
  database.save('Transaction', transaction);
  return transactionItem;
}

// Creates a Requisition
function createRequisition(database, user) {
  const requisition = database.create('Requisition', {
    id: generateUUID(),
    status: 'new',
    type: 'request',
    entryDate: new Date(),
    daysToSupply: 90, // 3 months
    serialNumber: (Math.floor(Math.random() * 1000000)).toString(),
    user: user,
  });
  return requisition;
}

// Creates a RequisitionItem and adds it to the requisition.
function createRequisitionItem(database, requisition, item) {
  const dailyUsage = item.dailyUsage;
  const requisitionItem = database.create('RequisitionItem', {
    id: generateUUID(),
    item: item,
    requistion: requisition,
    stockOnHand: item.totalQuantity,
    dailyUsage: dailyUsage,
    requiredQuantity: dailyUsage,
    comment: '',
  });
  requisition.addItem(requisitionItem);
  database.save('Requisition', requisition);
  return requisitionItem;
}

// Creates a Stocktake
function createStocktake(database, user) {
  const date = new Date();
  const stocktake = database.create('Stocktake', {
    id: generateUUID(),
    name: `Stocktake ${formatDateAndTime(date, 'slashes')}`,
    createdDate: date,
    status: 'new',
    comment: '',
    createdBy: user,
    serialNumber: '1337',
  });
  return stocktake;
}

// Creates a StocktakeItem and adds it to the Stocktake.
function createStocktakeItem(database, stocktake, item) {
  const stocktakeItem = database.create('StocktakeItem', {
    id: generateUUID(),
    item: item,
    stocktake: stocktake,
  });
  stocktake.items.push(stocktakeItem);
  database.save('Stocktake', stocktake);
  return stocktakeItem;
}

// Creates a TransactionBatch and adds it to the TransactionItem
function createTransactionBatch(database, transactionItem, itemBatch) {
  const { item, batch, expiryDate, packSize, costPrice, sellPrice } = itemBatch;
  const transactionBatch = database.create('TransactionBatch', {
    id: generateUUID(),
    itemId: item.id,
    itemName: item.name,
    itemBatch: itemBatch,
    batch: batch,
    expiryDate: expiryDate,
    packSize: packSize,
    numberOfPacks: 0,
    costPrice: costPrice,
    sellPrice: sellPrice,
    transaction: transactionItem.transaction,
  });
  transactionItem.addBatch(transactionBatch);
  database.save('TransactionItem', transactionItem);
  itemBatch.addTransactionBatch(transactionBatch);
  database.save('ItemBatch', itemBatch);
  return transactionBatch;
}
