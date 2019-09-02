// Budget Conroller
//
//

var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;
      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      // Createnew item based on inc or exp type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }
      // Push it into our data structure
      data.allItems[type].push(newItem);
      // Return new element
      return newItem;
    },

    deleteIem: function(type, id) {
      var ids, index;

      ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget: function() {
      // Calculate total inc and exp
      calculateTotal("exp");
      calculateTotal("inc");

      // Calculate the budget : income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage of income that we spend
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    calculatePercentages: function() {
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },
    testing: function() {
      console.log(data);
    }
  };
})();

// Ui Controller
//
//
var UIController = (function() {
  var Domstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dataLabel: ".budget__title--month"
  };

  var formatNumber = function(num, type) {
    var numSplit, int, dec, type;
    /*

+ or - before number
exactly 2 decimal points
comma separating the thousands
*/

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");

    int = numSplit[0];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3); // input 23510 , output 23,510
    }

    dec = numSplit[1];

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  return {
    getinput: function() {
      return {
        type: document.querySelector(Domstrings.inputType).value, // Will be either inc or exp
        description: document.querySelector(Domstrings.inputDescription).value,
        value: parseFloat(document.querySelector(Domstrings.inputValue).value)
      };
    },
    addListItem: function(obj, type) {
      var html, newHtml, element;

      // Create HTML string with placeholder text
      if (type === "inc") {
        element = Domstrings.incomeContainer;

        html = `<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix">
    <div class="item__value">%value%</div>
    <div class="item__delete">
        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
    </div>
    </div>
    </div>`;
      } else if (type === "exp") {
        element = Domstrings.expensesContainer;

        html = `
        <div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div>
            <div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn">
              <i class="ion-ios-close-outline" />
              </button>
            </div>
          </div>
        </div>
      `;
      }
      // Replace the placeholder text with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function(selectorID) {
      var el;
      el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },
    clearFields: function() {
      var fields, fieldsArr;

      fields = document.querySelectorAll(
        Domstrings.inputDescription + "," + Domstrings.inputValue
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      });
      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");

      document.querySelector(Domstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(Domstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        Domstrings.expenseLabel
      ).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(Domstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(Domstrings.percentageLabel).textContent = "----";
      }
    },
    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(Domstrings.expensesPercLabel);

      var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };

      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + " %";
        } else {
          current.textContent = "---";
        }
      });
    },

    displayMonth: function() {
      var now, year, month, months;
      months = [
        "Ianuarie",
        "Februarie",
        "Martie",
        "Aprilie",
        "Mai",
        "Iunie",
        "Iulie",
        "August",
        "Septembrie",
        "Octombrie",
        "Noiembrie",
        "Decembrie"
      ];
      now = new Date();
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(Domstrings.dataLabel).textContent =
        months[month] + " " + year;
    },

    changedType: function() {
      var fields = document.querySelectorAll(
        Domstrings.inputType,
        +" " + Domstrings.inputDescription + "," + Domstrings.inputValue
      );
    },

    getDOMstrings: function() {
      return Domstrings;
    }
  };
})();

// Global APP Controller
//
//
var controller = (function(budgetCtrl, UICtrl) {
  var setupEventListeners = function() {
    var DOM;
    DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
  };

  // document
  //   .querySelector(DOM.inputType)
  //   .addEventListener("change", UICtrl.changedType);

  var updateBudget = function() {
    // 4.Calculate the budget
    budgetCtrl.calculateBudget();

    // Return the budget
    var budget = budgetCtrl.getBudget();

    // 5.Display the budget in Ui
    UICtrl.displayBudget(budget);
  };

  updatePercentages = function() {
    // 1. Calculate the percentages
    budgetCtrl.calculatePercentages();

    // 2. Read the percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();

    // 3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function() {
    var input, newItem;

    // 1. Get the field input data
    var input = UICtrl.getinput();
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller
      var newItem = budgetCtrl.addItem(
        input.type,
        input.description,
        input.value
      );
      // 3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      // clear the fields
      UICtrl.clearFields();

      // 4. Calculate and uptade budget
      updateBudget();

      // 5. Calculate and update percentages
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function(event) {
    var itemID, splitId, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      // inc-1
      splitId = itemID.split("-");
      type = splitId[0];
      ID = parseInt(splitId[1]);

      // 1. Delete the item from the data structure
      budgetCtrl.deleteIem(type, ID);
      // 2. Delete the item from the UI
      UICtrl.deleteListItem(itemID);
      // 3. Update and show the new budget
      updateBudget();

      // 4. Calculate and update the percentages
      updatePercentages();
    }
  };

  return {
    init: function() {
      console.log("Apliication has started.");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();
