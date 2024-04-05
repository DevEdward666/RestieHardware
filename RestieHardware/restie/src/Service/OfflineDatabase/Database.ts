import Dexie, { IndexableType } from "dexie";
import {
  PostDeliveryInfo,
  PostDeliveryInfoOffline,
} from "../../Models/Request/Inventory/InventoryModel";

const DATABASE_USER_NAME = "RestieDB";
const DATABASE_USER_VERSION = 2;

export class Database extends Dexie {
  deliveryInfo!: Dexie.Table<PostDeliveryInfoOffline, string>; // converted to schema

  constructor(databaseName: string) {
    super(databaseName);
    this.version(DATABASE_USER_VERSION)
      .stores({
        deliveryInfo:
          "orderid, deliveredby,deliverydate,imgData, createdat,createdby",
      })
      .upgrade((trans) => {
        // This function is called when the schema is upgraded from the old version to the new version
        if (this.verno < 1) {
          this.deliveryInfo.toCollection();
        }
        // Add other migration steps for other tables if needed
      });

    this.deliveryInfo = this.table("deliveryInfo");

    this.on("blocked", (event) => {
      console.error(
        "Database upgrade failed. Please close all open tabs/windows and reload the application."
      );
      event.preventDefault(); // Prevent the default error behavior
    });

    this.on("versionchange", (event) => {
      console.error(
        "Another tab/window is attempting to upgrade the database. Please close this tab/window to prevent data loss."
      );
      event.preventDefault(); // Prevent the default error behavior
    });
  }
}
export const user_db = new Database(DATABASE_USER_NAME);
// export const createDatabaseBackup = async () => {
//   try {
//     const blob = await exportDB(user_db);
//     const url = URL.createObjectURL(blob);

//     const link = document.createElement("a");
//     link.href = url;
//     link.download = `${DATABASE_USER_NAME}.json`;
//     link.textContent = "Download Users Backup";
//     document.body.appendChild(link);
//     link.click();

//     URL.revokeObjectURL(url);
//   } catch (error) {
//     console.error("Error creating database backup:", error);
//   }
// };

// export const importDatabaseUserBackup = async () => {
//   try {
//     user_db.open();
//     const user_profileEmpty = (await user_db.user_profile.count()) === 0;
//     if (user_profileEmpty) {
//       const jsonStr = JSON.stringify(importdatabase);
//       const blob = new Blob([jsonStr], { type: "application/json" });
//       await importDB(blob);
//       return true;
//     } else {
//       return true;
//     }
//   } catch (error) {
//     console.error("Error importing database:", error);
//   }
// };
export const exportDatabase = async () => {
  const backupData = await Promise.all([user_db.deliveryInfo.toArray()]);

  const backupObject = {
    user_profile: backupData[0],
  };

  const backupJSON = JSON.stringify(backupObject);
  // You can save or export the backupJSON to a file or store it as needed.
  return backupJSON;
};

/**
 * This function loops through all tables in the database and downloads all of the data for the current user. The downloaded
 * data is saved into the tables.
 *
 * This is only used for sync after login. There may be other areas which will benefit this function. The whole point of this
 * function is to focus on bringing in all data from the server to the local indexeddb for consumption in the app.
 *
 * @returns void
 */
// export const syncDownload = async () => {
//   try {
//     const currentUser = await getCurrentUser();
//     const currentIdToken = await getCurrentIdToken();

//     // Check if there is a current user cached in memory
//     if (!currentUser) return;
//     // Check if the current user cached in memory has a valid idToken fetch a new one from google if needed.
//     const idToken = currentIdToken;
//     if (!idToken) {
//       return;
//     }
//     // loop through all the tables
//     await Promise.all(
//       user_db.tables.map(async (table) => {
//         // download data for each table
//         const dataUrl = `${RuntimeConfig.apiBaseUrl}/api/user/${currentUser.uid}/${table.name}`;
//         const response = await fetch(dataUrl, {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${idToken}`,
//           },
//         });

//         const responseData = await response.json();

//         // validate responseData, terminate function with throw if error encountered
//         const apiResponseResult =
//           await NosaUserDatabaseSyncModel.safeParseAsync(responseData);

//         if (!apiResponseResult.success) {
//           throw new Error(
//             `Error downloading data from api for table ${
//               table.name
//             }. Error: ${JSON.stringify(apiResponseResult.error)}`,
//             { cause: apiResponseResult.error }
//           );
//         }

//         // only update local copy if necessary
//         await Promise.all(
//           apiResponseResult.data.content.map(async (item) => {
//             const table = user_db.table(item.table);
//             const localItem: INosaUserDatabaseTables = await table.get(
//               item.data.id
//             );

//             if (localItem) {
//               // Gil: no longer relevant to other cases - logging will only slow down execution.
//               if (
//                 localItem.lastSynced > 0 &&
//                 localItem.lastSynced < item.data.lastSynced
//               ) {
//                 // update in this case because the local copy is much older than the remote copy. another devices probably updated the remote copy.
//                 await table.put(item.data, item.data.id);
//               }
//             } else {
//               // there is no local equivalent of what is found on the API. put the item in the local db.
//               await table.put(item.data, item.data.id);
//             }
//           })
//         );
//       })
//     );
//   } catch (ex) {
//     console.debug(`Sync Download Error ${JSON.stringify(ex)}`);
//   }
// };

/**
 * This function loops through all the tables and finds all the items on all tables that have lastSynced < 0. This
 * function will then upload all of those items to the API. The API returns an updated version of those items that
 * includes lastSynced whose value was assigned by the server. The function will then update the indexeddb tables
 * with data that have lastSynced assigned.
 *
 * As you may see, this funtion is quite heavy so we must be judicious in using this function making sure to only
 * put this on areas wherein it is not being called too often. It is also important that this function is also called
 * such that data from local is pushed to remote api.
 *
 * @returns void
 */
// export const syncUpload = async () => {
//   try {
//     const currentUser = await getCurrentUser();
//     const currentIdToken = await getCurrentIdToken();

//     // Check if there is a current user cached in memory
//     if (!currentUser) return;
//     // Check if the current user cached in memory has a valid idToken fetch a new one from google if needed.
//     const idToken = currentIdToken;
//     if (!idToken) {
//       return;
//     }
//     const raw = await Promise.all(
//       user_db.tables.map(async (table) => {
//         const items = await table.where("lastSynced").below(0).toArray();

//         if (items.length > 0) {
//           // console.log(`table.name ${table.name} ${JSON.stringify(items)}`);
//           const remapItems = items.map((item) => {
//             return {
//               table: table.name,
//               data: item,
//             };
//           });
//           return remapItems;
//         } else {
//           return [];
//         }
//       })
//     );

//     // data needs to be flattened because it is an array of arrays (ie from
//     // array of (array of rows within tables) , to array of (rows and tables) )
//     const flatRaw = raw.flat();

//     // embed data within content so that it complies with the one api expects to receive.
//     const dataToPush = { content: flatRaw };

//     // check if data is okay to push to server
//     const parseResult = await NosaUserDatabaseSyncModel.safeParseAsync(
//       dataToPush
//     );
//     if (!parseResult.success) throw parseResult.error;
//     // console.log(parseResult.data);

//     // call the server api
//     const dataUrl = `${RuntimeConfig.apiBaseUrl}/api/user/${currentUser!.uid}`;
//     const response = await fetch(dataUrl, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${idToken}`,
//       },
//       body: JSON.stringify(parseResult.data),
//     });
//     // If bad response, cut off this function by throwing error
//     if (!response.ok) {
//       throw new Error(`Sync Upload Error1 ${response.status}`, {
//         cause: response.statusText,
//       });
//     }
//     // introspect responses and see if they are valid for consumption again by the db
//     const apiResponse = await response.json();
//     const apiResponseResult = await NosaUserDatabaseSyncModel.safeParseAsync(
//       apiResponse
//     );
//     if (!apiResponseResult.success) {
//       throw new Error(
//         `Sync Upload Response Unreadble Error ${response.status}`,
//         { cause: apiResponseResult.error }
//       );
//     }

//     // write responses back to the database
//     await Promise.all(
//       apiResponseResult.data.content.map(async (item) => {
//         const table = user_db.table(item.table);
//         // console.log(`table ${item.table}, item.data.id: ${item.data.id}`)
//         return await table.put(item.data, item.data.id);
//       })
//     );
//   } catch (ex) {
//     console.debug(`Sync Upload Error2 ${JSON.stringify(ex)}`);
//   }
// };

export type SyncDeleteOptions = {
  userId: string;
  token: string;
};

/**
 * This function requires internet connection. It deletes all data associated with the user from the cloud
 * storage.
 *
 * @returns void
 */

export const createItem = async (
  tableName: string,
  item: PostDeliveryInfoOffline
) => {
  try {
    const table = user_db.table(tableName);
    return await table.add(item, item.orderid);
  } catch (error) {
    console.error(`Error creating item in table ${tableName}:`, error);
    throw error;
  }
};

export const getAllItems = async (tableName: string) => {
  try {
    const table = user_db.table(tableName);
    return await table.toArray();
  } catch (error) {
    console.warn(`Warning fetching all items from table  ${tableName}`, error);
    throw error;
  }
};
export const getAllItemsWithOrder = async (
  tableName: string,
  orderBy: string
) => {
  try {
    const table = user_db.table(tableName).orderBy(orderBy);
    return await table.toArray();
  } catch (error) {
    console.warn(`Warning fetching all items from table  ${tableName}`, error);
    throw error;
  }
};
export const queryItems = async (
  tableName: string,
  tableData: string,
  queryString: string
) => {
  try {
    const table = user_db.table(tableName).where(tableData).equals(queryString);
    return await table.toArray();
  } catch (error) {
    console.warn(tableName);
    console.warn(tableData);
    console.warn(`Warning fetching all items from table  ${tableName}`, error);
    throw error;
  }
};

export const putItem = async (
  tableName: string,
  item: any,
  key?: IndexableType
) => {
  try {
    const table = user_db.table(tableName);
    await table.put(key, item);
  } catch (error) {
    console.warn(`Warning updating item in table  ${tableName}`, error);
    throw error;
  }
};

export const deleteItem = async (tableName: string, itemId: IndexableType) => {
  console.debug(`delete request on table ${tableName} with id ${itemId}`);
  try {
    const table = user_db.table(tableName);
    await table.delete(itemId);
  } catch (error) {
    console.warn(`Warning deleting item from table ${tableName}:`, error);
    throw error;
  }
};
export const deleteAllUsersTableData = async () => {
  try {
    // const table = user_db.delete();
    // await table;
    await Promise.all(
      user_db.tables.map(async (table) => {
        await table.clear();
      })
    );
  } catch (error) {
    console.warn(`Warning deleting item from table`, error);
    throw error;
  }
};
