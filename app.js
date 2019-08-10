//Budget Controller
var budgetController = (function(){
    var Expence = function(id, desc, value){
        this.id = id;
        this.desc = desc;
        this.value = value;
        this.percentage = -1;
    };
    Expence.prototype.calcPercentge = function(totalInc){
        if (totalInc > 0){
            this.percentage = Math.round( (this.value / totalInc) * 100);
        } else {
            this.percentage = -1;
        }
    };
    Expence.prototype.getPercentage = function(){
        return this.percentage;
    };
    var Income = function(id, desc, value){
        this.id = id;
        this.desc = desc;
        this.value = value;
    };

    var calclateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    totalExpenses = 0;

    var data = {
        allItems: {
            exp : [],
            inc : []
        },
        totals:{
            exp:0,
            inc:0
        },
        budget : 0,
        percentage : -1
    };
    return{
         addItem: function(type, des, val){
             var newItem, ID;
             if (data.allItems[type].length > 0){
                     ID = data.allItems[type][data.allItems[type].length -1].id + 1;
                } else {
                    ID = 0;
                }
             if (type === 'exp'){
                newItem = new Expence(ID, des, val);
             } else if (type === 'inc'){
                 newItem = new Income(ID, des, val);
             }
             data.allItems[type].push(newItem);
             return newItem;
        },
        deleteItem: function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        calclateBudget: function(){
            //calclate total income
            calclateTotal('inc');
            calclateTotal('exp');

            //Calclate the budget: income - expense
            data.budget = data.totals.inc - data.totals.exp; 
            //calculate the percentage of income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        calculatePercentage : function(){
            data.allItems.exp.forEach(function(current){
                current.calcPercentge(data.totals.inc);
            });
        },
        getPercentages : function(){
            var allPerc = data.allItems.exp.map(function(current){
                return current.getPercentage();
            });
            return allPerc;
        },
        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing : function(){
            console.log(data);
        }
    };
})();
//UI Controller
var UIController = (function(){
    var domStrings = {
        inputType : '.add__type',
        inputDesc : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeContainer : '.income__list',
        ExpensesContainer : '.expenses__list',
        budgetLable : '.budget__value',
        incomeLabel : '.budget__income--value',
        expenseLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        expPercentageLabel : '.item__percentage',
        month : '.budget__title--month'
    }

    var formatNumber = function(num, type){
        var num, int, dec, type;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        if(int === '0' && dec === '00'){
            return int + '.' + dec;
        } else {
            return (type === 'exp'? '-' : '+' ) + int + '.' + dec;
        }
    };
    var nodeListForeach = function(list, callback){
        for (var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };
    return{
        getInput: function(){
            return {
                type : document.querySelector(domStrings.inputType).value,
                desc : document.querySelector(domStrings.inputDesc).value,
                value : parseFloat(document.querySelector(domStrings.inputValue).value)
            }
        },
        addListItem: function(obj, type){
            var html, newHtml, element;
            //Create HTML string with placeholder
            if (type === 'inc'){
                element = domStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp'){
                element = domStrings.ExpensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            //Replace a place holder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%desc%', obj.desc);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Insert the HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
            
        },
        deleteListItem: function(id){
            var el = document.getElementById(id);
            el.parentNode.removeChild(el);
        },
        clearFields: function(){
            var fields, firldsArr ;
            fields = document.querySelectorAll(domStrings.inputDesc + ',' + domStrings.inputValue);
            firldsArr = Array.prototype.slice.call(fields);
            firldsArr.forEach( function(current, index, array) {
                current.value = '';
            });
            firldsArr[0].focus();
        },
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            if(obj.budget > 0 ){
                document.querySelector(domStrings.budgetLable).classList.remove('minus');
                document.querySelector(domStrings.budgetLable).classList.add('plus');
            } else if (obj.budget < 0 ){
                document.querySelector(domStrings.budgetLable).classList.remove('plus');
                document.querySelector(domStrings.budgetLable).classList.add('minus');
            } else if (obj.budget === 0 ){
                document.querySelector(domStrings.budgetLable).classList.remove('plus');
                document.querySelector(domStrings.budgetLable).classList.remove('minus');
            }
            document.querySelector(domStrings.budgetLable).textContent = formatNumber(obj.budget, type);
            document.querySelector(domStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(domStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if(obj.percentage > 0){
                document.querySelector(domStrings.percentageLabel).textContent = obj.percentage + '%';
            } else{
                document.querySelector(domStrings.percentageLabel).textContent = '---';
            }
        },
        displayPercentage: function(perc){
            var fields = document.querySelectorAll(domStrings.expPercentageLabel);
            
            nodeListForeach(fields, function(current, index){
                if(perc[index] > 0){
                    current.textContent = perc[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth : function(){
            var now, month, months, year;
            now = new Date();
            months = ['January', 'Feburary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(domStrings.month).textContent = months[month] + ' ' + year;
        },

        changeType : function(){
            var fields = document.querySelectorAll(
                domStrings.inputType + ',' + domStrings.inputDesc + ',' + domStrings.inputValue
            );
            nodeListForeach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(domStrings.inputBtn).classList.toggle('red');
        },

        getDomStrings : function(){
            return domStrings;
        }
    };
})();

var controller = (function(budgetCtrl, UICtrl){

    var setUpEventListner = function(){
        var DOM = UICtrl.getDomStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', controlAddItem);

        document.querySelector('keypress', function(e){
            if (e.keyCode === 13 || e.which === 13) {
                controlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', controlDelete);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };

    var calcBudget = function(){
        //Caluclate the budget
        budgetCtrl.calclateBudget();
        //Return budget
        var budget = budgetCtrl.getBudget();

        //Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentage = function (){
        //calc percentage
        budgetCtrl.calculatePercentage();
        //read percentage from the budget controller
        percentages = budgetCtrl.getPercentages();
        //update the UI with the new percentage
        UICtrl.displayPercentage(percentages);
    };

    var controlAddItem = function () {
        var input, newItem;
        //Get the field input data
        input = UICtrl.getInput();
        var DOM = UICtrl.getDomStrings();
        document.querySelector(DOM.inputDesc).classList.remove('error');
        document.querySelector(DOM.inputValue).classList.remove('error');

        if (input.desc !== '' && !isNaN(input.value) && input.value > 0){
            //Add the item to the budgetController
            newItem = budgetCtrl.addItem(input.type, input.desc, input.value);
            //Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            //Clear the fields
            UICtrl.clearFields();
            //Calculate and update budget
            calcBudget();
            //Calc and Update percentages
            updatePercentage();

        } else {
            if (input.desc === ''){
                document.querySelector(DOM.inputDesc).classList.add('error');
            }
            if (isNaN(input.value) || input.value <= 0){
                document.querySelector(DOM.inputValue).classList.add('error');
            }
        }
            
    };

    var controlDelete = function(event){
        var itemId, spritId, type, ID;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemId){
            spritId = itemId.split('-');
            type = spritId[0];
            ID = parseInt(spritId[1]);

            //Delete an item from the data structure
            budgetCtrl.deleteItem(type, ID);
            //Delete the item from the UI
            UICtrl.deleteListItem(itemId);
            //Update and show the new budget
            calcBudget();
        }
    };

    return{
        init: function(){
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setUpEventListner();
        }
    }
})(budgetController, UIController);

controller.init();