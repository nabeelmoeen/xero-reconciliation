// 20210205
// structure of Xero bank reconciliation page
// Line :  each reconciliation item is displayed as a line (class=line) with a unique GUID for transactionID
//          set as the Div ID for the .line container.
// Left block: left cell/block of the line contains the bank statement transaction
//              with the class name including 'bank-transaction'
// Middle block: middle cell/block between the bank transaction and Xero transaction 
//              contains the OK button. if there is a proposed Xero match than the 
//              (class = okayButton) element with the link is visible otherwise the visibility is set to 'hidden'
// Right block: the Xero transaction to be matched/reconciled with the bank transaction in the left block
// More Details: more details (pop-up) for the transactions are in hidden float windows 
//              referenced by div container id: transactionID Guid minus first 2 characters.
//              This data is generated and added to the document when any 'More Details' is loaded by 
//              passing the mouse pointer over.
//          
// ToDo:    Workaround for hack to load More details
// 
// Assumption:
// *- the first element in the details for left and right block is going to be the date
// *- the transaction reference for Xero will always be preceded with the 'Ref:' keyword/text
// *- the 'Ref:' text will be the third line of the Xero transaction
try 
{ 
    const mouseOverEvent = new Event ('mouseover');
    const mouseOutEvent = new Event('mouseout');
    
    //hack to generate contents of the 'More Details' pop-ups for bank transaction details

    document.querySelectorAll(".more").forEach(element => {
        element.dispatchEvent(mouseOverEvent)
    }); 

    // get all displayed Lines on the reconciliation page
    var x = document.querySelectorAll(".line");

    // hack: added one second delay to allow More Details to load
    setTimeout(() => {
        x.forEach(checkForMatch);    
    }, 1000);
 
}
catch (err)
{ 
    console.log(err.message)
}


function checkForMatch(item) {
    try{
        // first get the OK box to check if okayButton is visible. 
        // if not, this line is not a Xero proposed match and should be skipped
        x = item.querySelector(":scope .ok")

        if (x) {
            var okButton = x.querySelector(":scope .okayButton")

             if (okButton.getAttribute('style').includes('visibility: visible'))
             {
                if(reconciled(item))
                    item.style.border = "3px solid green"
                else 
                    item.style.border = "3px solid red"

             }
        }
    }
    catch(e) {
        console.log(e.message)
    }
}

function reconciled(item)
{
    try {
        // get the bank transaction ID for the line item.
        var divId = item.id;
        // date difference between Bank Transaction and Xero transaction
        var daysThreshold = 3;

        console.log("Transaction ID: " + divId);


        leftBlock = item.querySelector(":scope .bank-transaction")
        rightBlock = item.querySelector(":scope .matched")

        // if rightBlock is a match then the class idenfitier for the block is set to
        // .matched. otherwise it is set to .create, in which case do not reconcile
        if (!(leftBlock) || !(rightBlock)) { 
            console.log("Check failed. Xero Rule creation transaction, skipping and moving to next proposed match.")
            return false;
        }
       
        // Date Check
        xeroDate = rightBlock.querySelector(".details").children[0].innerHTML;
        bankTransactionDate = leftBlock.querySelector(".details").children[0].innerHTML;
        if (!dateCheck(xeroDate, bankTransactionDate, daysThreshold)) return false;

        // Amount Check 
        xeroAmount =  rightBlock.querySelector(".amount.set").innerHTML
        bankTransactionDetailsTableCells = document.querySelector("#statementTip" + divId.slice(2)).querySelectorAll("td")
        var bankTransactionAmount;

        for (i = 0; i < bankTransactionDetailsTableCells.length; i++)
        {
            if (bankTransactionDetailsTableCells[i].innerHTML == "Transaction Amount") {
               bankTransactionAmount =  bankTransactionDetailsTableCells[i+1].innerHTML.replace(/\&nbsp;/g, '')
               break;                
            }
        }
        console.log("2. Amount " + ((bankTransactionAmount==xeroAmount)?"Check Passed" : "Check failed") + 
            "\tBank Amount: " + bankTransactionAmount + "\tXero Amount: " + xeroAmount + "\t:")

        // Reference ID Check
        console.log(document.querySelector("#statementTip" + divId.slice(2)).innerHTML)
        try {
            xeroReference = rightBlock.querySelector(".details").children[2].innerHTML
            console.log(xeroReference)

            bankTransactionDetails = document.querySelector("#statementTip" + divId.slice(2)).innerHTML

            return (bankTransactionDetails.includes(xeroReference.slice(4).slice(0,10)))
        }
        catch(e) 
        {
            console.log("3. Reference Check Failed. No Transaction reference found for the Xero Transaction")
            return false;
        }
    }
    catch (e) {
        console.log('error occured: ' + e.message)
        return false;
    } 
    
    return true;
}

function dateCheck(dateString1, dateString2, varianceInDays) {
    inDays = parseInt( (Date.parse(dateString1) - Date.parse(dateString2))/ (24*3600*1000))
    console.log("1. Date " + (Math.abs(inDays)>varianceInDays?"Check Failed": "Check Passed") + "\tDays difference:" + Math.abs(inDays) + " vs threshold of " + varianceInDays)
    return (Math.abs(inDays)>varianceInDays?false:true);
}