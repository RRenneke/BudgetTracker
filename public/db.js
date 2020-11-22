let db;
// create a budget database.
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(e) {
  const db = e.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(e) {
  db = e.target.result;

  // check if app is online before reading from db
  if (navigator.onLine) {
    getTransactions();
  }
};

request.onerror = function(e) {
  console.log("Oh No! " + e.target.errorCode);
};

//function to store the added user input
function userSave(userInput) {
  const userTransaction = db.userTransaction(["pending"], "readwrite");
  const store = userTransaction.objectStore("pending");
  store.add(userInput);
}

//get all the user inputs and put then in allInputs
function getTransactions() {
  const userTransaction = db.userTransaction(["pending"], "readwrite");
  const store = userTransaction.objectStore("pending");
  const allInput = store.allInput();

  allInput.onsuccess = function() {
    if (allInput.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(allInput.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        const userTransaction = db.userTransaction(["pending"], "readwrite");
        const store = userTransaction.objectStore("pending");
        store.clear();
      });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", getTransactions);