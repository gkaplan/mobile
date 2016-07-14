import Realm from 'realm';

// Only used for the purpose of cleaning up name visibility when deleted
export class NameStoreJoin extends Realm.Object {
  destructor(database) {
    console.log(`Deleting ${this}`);
    if (!this.joinsThisStore) return; // Don't need to change visibility if record not this store
    const nameResults = database.objects('Name').filtered('id == $0', this.nameId);
    if (!nameResults || nameResults.length <= 0) return; // Doesn't join a name in this database
    // Make the name no longer visible in this store
    const name = nameResults[0];
    name.isVisible = false;
    database.save('Name', name);
  }

  toString() {
    return `Joins name ${this.nameId} with ${this.joinsThisStore ? 'this' : 'another'} store`;
  }
}