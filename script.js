// document.getElementById("select").addEventListener('change', function() {
//     var select = document.getElementById("select");
//     // select.addEventListener('focus', function() {
//     //     this.style.borderColor = 'blue';
//     // });

//     if(this.options[this.selectedIndex].value === '+') {
//         // changeColor();
//         select.addEventListener('focus', function() {
//             this.style.borderColor = 'blue';
//         });
//     } else if(this.options[this.selectedIndex].value === '-') {
//         select.addEventListener('focus', function() {
//             this.style.borderColor = 'red';
//         });
//     }
// });

// function changeColor() {
//     console.log(this);
//     // this.style.backgroundColor = 'blue';
// }

var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0)
            this.percentage = Math.round((this.value / totalIncome) * 100);
        else
            this.percentage = -1;
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
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

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (curr) {
            sum += curr.value;
        });

        data.totals[type] = sum;
    }

    return {
        addItem: function (type, desc, val) {
            var newItem;
            var ID;
            var prop = type === '-' ? 'exp' : 'inc';
            
            // Creating new ID, last element of the type array + 1
            if (data.allItems[prop].length > 0)
                ID = data.allItems[prop][data.allItems[prop].length - 1].id + 1;
            else
                ID = 0;

            // Creating new Item
            if (type === '-') {
                newItem = new Expense(ID, desc, val);    
            } else {
                newItem = new Income(ID, desc, val);
            }

            // Pushing it to the Array
            data.allItems[prop].push(newItem);

            // returning the new element
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;

            var ids = data.allItems[type].map(function (curr) {
                return curr.id;
            });

            index = ids.indexOf(id);

            if (index !== -1)
                data.allItems[type].splice(index, 1);

        },

        calculateBudget: function () {

            // calc total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            // calc the budget : inc - exp
            data.budget = data.totals.inc - data.totals.exp;

            // calc the percentage
            if (data.totals.inc > 0)
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            else
                data.percentage = -1;

        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (curr) {
                curr.calcPercentage(data.totals.inc);    
            });
        },

        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (curr) {
                return curr.getPercentage();
            });
            
            return allPerc;
        },
        
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function () {
            console.log(data);
        }
    };

})();


var UIController = (function () {
    
    var DOMstrings = {
        type: '#select',
        description: '#description',
        value: '#value',
        btn: '#add_btn',
        income: '.incomeList',
        expense: '.expensesList',
        budgetLabel: '.money',
        incomeLabel: '#incomeNum',
        expensesLabel: '#expNum',
        percentageLabel: '.labelPerc',
        lists: '.lists',
        expensesesPercLabel: '.perc',
        dateLabel: '.date'
    };

    var formatNumber = function (num, type) {
        var numSplit, int, dec, sign;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        dec = numSplit[1];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // 1500 1,
        }

        type === 'exp' ? sign = '-' : sign = '+';

        return sign + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function (list, callback) {
        for (let i = 0; i < list.length; i++)
            callback(list[i], i);
    };

    return {
        getInput: function () {
            var type = document.querySelector(DOMstrings.type).value; // + or -
            var description = document.querySelector(DOMstrings.description).value;
            var value = Number.parseFloat(document.querySelector(DOMstrings.value).value);
            return { type, description, value };
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;

            if (type === '-') {
                element = DOMstrings.expense;
                html = '<div class="item" id="exp-%id%"><div class="item_desc">%description%</div> <div class="right"><div class="item_val">%value%<div class="perc">-25%</div></div><div class="btn_delete"><button class="btn_delete-btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else {
                element = DOMstrings.income;
                html = '<div class="item" id="inc-%id%"><div class="item_desc">%description%</div> <div class="right"><div class="item_val">%value%</div><div class="btn_delete"><button class="btn_delete-btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function (selectorID) {
            var element;
            element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.description + ', ' + DOMstrings.value);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            var type;

            obj.budget > 0 ? type = 'inc' : 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if(obj.percentage > 0)
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            else
            document.querySelector(DOMstrings.percentageLabel).textContent = '/';


        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesesPercLabel);

            nodeListForEach(fields, function (curr, idx) {
                if (percentages[idx] > 0)
                    curr.textContent = percentages[idx] + '%';
                else
                    curr.textContent = '/';
            });

        },

        displayDate: function () {
            var now, month;
            now = new Date();
            month = now.toLocaleString('en-us', { month: 'long', year: 'numeric' });
            now.toLocaleString()


            document.querySelector(DOMstrings.dateLabel).textContent = month;
        },

        changedType: function () {
            var fields = document.querySelectorAll(DOMstrings.type + ',' + DOMstrings.description + ',' + DOMstrings.value);
            
            nodeListForEach(fields, function (curr) {
                curr.classList.toggle('green-focus');
            });

            document.querySelector(DOMstrings.btn).classList.toggle('green');
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };

})();

var controller = (function (budgetCtrl, UICtrl) {
    
    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.btn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.lists).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.type).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function () {
        // 1. Calc the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function () {
        // 1. Calc the percentages
        budgetCtrl.calculatePercentages();

        // 2. Read the percentages from the budget ctrl
        var perc = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(perc);
    };

    var ctrlAddItem = function () {
        var input, newItem;

        // 1. Get the input data
        input = UICtrl.getInput();

        if (input.description !== "" && !Number.isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calc and update the budget
            updateBudget();

            // 6. Calc and update percentages
            updatePercentages();

        }
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = Number.parseInt(splitID[1]);

            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update the budget
            updateBudget();

            // 4. Calc and update percentages
            updatePercentages();
        }
    };

    return {
        init: function () {
            setupEventListeners();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            UICtrl.displayDate();
        }
    }


})(budgetController, UIController);

controller.init();

// 96, 4:30 end