function addName() {
    let index = document.querySelectorAll('.containerInput').length
    const inputModel = `<div id='key-${index}' class="row containerInput">
                            <input type="text" placeholder="Nome" onkeypress="this.style.borderColor = '#a5a5a5'" class="members word">
                            <img src="./assets/times-solid.png" onclick="removeInput(${index})" class="remove">
                        </div>`;
    const input = document.querySelectorAll('.containerInput');
    input[input.length - 1].insertAdjacentHTML("afterend", inputModel);

    if(input[0].children.length == 1) {
        input[0].insertAdjacentHTML('beforeend', `<img src="./assets/times-solid.png" onclick="removeInput(0)" class="remove">`)
    }
}

function changeNumberMember(number) {
    const nMember = document.querySelector('#Number');
    let valueMember = Number(nMember.value) + number;

    if(valueMember >= 2) {
        nMember.value = valueMember;
    }

    updateCurrentAllocation();
}

function removeInput(index) {
    document.querySelector(`#key-${index}`).remove();

    const input = document.querySelectorAll('.containerInput');
    if(input.length === 1) {
        input[0].children[1].remove();
    }
}

function outContainerAnimation() {
    var container = document.querySelector('#container');
    var btnContainer  = document.querySelector('#btnContainer');
    var groupContainer = document.querySelector('#groupContainer');

    groupContainer.innerHTML = '';
    if(document.querySelectorAll('.modelGroupsCard').length < 1) {
        container.style.transform = `translateY(-${parseInt(document.querySelector('body').clientHeight - 541)}px)`;
        btnContainer.style.transform = `translateY(-${parseInt(document.querySelector('body').clientHeight - 421)}px)`;
        groupContainer.style.transform = `translateY(-${parseInt(document.querySelector('body').clientHeight - 361)}px)`;
        container.style.opacity = 0;
    }

}

function innerDivGroupsOnHTML(groups) {
    let colors = ['#FDDC5C', '#BDF6FE'];
    let groupContainer = document.querySelector('#groupContainer');
        groupContainer.innerHTML = '';
        
    for(group in groups) {
        let color = colors[group % 2];
        groupContainer.insertAdjacentHTML('beforeend', `<div class="modelGroupsCard"></div>`);

        let groupCard = document.querySelectorAll('.modelGroupsCard');
            groupCard[group].style.backgroundColor = color;

        names = "<p>"

        groups[group].forEach(member => {
            //groupCard[group].insertAdjacentHTML('beforeend', `<p>${member}</p`);
            names += `${member} `
        });
        // remove the last <br />
        //names = names.substring(0, names.length - 6);
        names += "</p>"
        groupCard[group].insertAdjacentHTML('beforeend', names );
    }
}

function validateAllInput() {
    let listOfInputs = document.querySelectorAll('.members');
    let returnValue = true;
    listOfInputs.forEach((item, i) => {
        if(item.value.length < 1) {
            item.style.borderColor = 'red';
            returnValue = false;
        }
    });
    return returnValue;
}

/**
 * getMembers
 * - return an array of names
 * - Each name is a line from the textarea#members
 */
function getMembers() {
    // get the value of textarea#members
    let members = document.querySelector('#members').value;
    let membersArray = members.split('\n');
    // remove any members equivalent to an empty string or whitespace 
    membersArray = membersArray.filter(member => member.trim() != '');
    return membersArray;
}

/**
 * updateCurrentAllocation
 * - when number of names or people per group change, 
 *   update the current allocation display
 * - #possible_num_groups = the number of groups that can be made
 * - #left_over = the number of people left over
 */

function updateCurrentAllocation() {
    let members = getMembers();
    let numGroups = document.querySelector('#Number').value;
    let possibleNumGroups = Math.floor(members.length / numGroups);
    let leftOver = members.length % numGroups;

    numGroupsElem = document.querySelector('#possible_num_groups');
    if (numGroupsElem) {
        numGroupsElem.innerHTML = possibleNumGroups;
    }
    leftOverElem = document.querySelector('#left_over');
    if (leftOverElem) {
        leftOverElem.innerHTML = leftOver;
    }
}

function generateGroup() {
    /*let member = document.querySelectorAll('.members');
    let valueMember = new Array();
    member.forEach(e => {
        valueMember.push(e.value);
    }); */

    let valueMember = getMembers();

    let qtdGrp = document.querySelector('#Number').value;

    if(valueMember.length < Number(qtdGrp) + 1) {
        setToasted(false, 'Add more people');
    } else if(validateAllInput()) {
        let nGrps = valueMember.length == qtdGrp ? valueMember.length : Math.ceil(valueMember.length / qtdGrp);

        qtdGrp = qtdGrp == valueMember.length ? 1 : qtdGrp
        var Groups = {};

        for(var n = 0; n < nGrps; n++) {
            Groups[n] = new Array();
            for(var index = 0; index < qtdGrp; index++) {
                let random = Math.floor(Math.random() * valueMember.length);
                if(valueMember[random]) {
                    Groups[n].push(valueMember[random]);
                    valueMember.splice(random, 1);
                }
            }
        }

        displayGroups(Groups)
    } else {
        setToasted(false, 'All fields must be prefilled');
    }
}

/**
 * displayGroups(Groups)
 * - given an array of arrays of names update the page to display the allocation
 */
function displayGroups(Groups) {
    outContainerAnimation();
    setTimeout(() => {
        innerDivGroupsOnHTML(Groups);
        document.querySelector('#btnContainer').style.justifyContent = 'space-around';
        document.querySelector('.btnModel:last-child').style.display = 'flex';
    }, 700);
    // display the save allocation and hide the load allocation button
    document.querySelector('#saveAllocation').style.display = 'block';
    document.querySelector('#loadAllocation').style.display = 'none';
}

/** 
 * saveAllocation()
 * - only able to be called when groups have been generated
 * - indicated by the presence of at least one div.modelGroupsCard
 * - extract a group allocation structure from those cards
 * - save it as a JSON strong to local storage as dj-group-generator
 */

function saveAllocation() {
    // check if there are any groups to save
    let groups = document.querySelectorAll('.modelGroupsCard');
    if (groups.length == 0) {
        setToasted(false, 'No groups to save');
        return;
    }

    let allocation = getCurrentAllocation(groups);
    let number = document.querySelector('#Number').value;

    // convert to JSON and save to local storage
    let allocationJSON = JSON.stringify(allocation);
    localStorage.setItem('dj-group-generator', allocationJSON);
    localStorage.setItem('dj-group-generator-number', number);
    console.log(`Saved allocation: ${allocationJSON}`);
    setToasted(true, 'Saved current group allocation');
}

/**
 * getCurrentAllocation(groups)
 * - given a collection of div.modelGroupsCard elements containing names separate by <br> tags
 * - create an array of arrays 
 * - each array is a group in turn containing an array of names
 * - return the array of arrays
 */

function getCurrentAllocation(groups) {
    let allocation = [];
    groups.forEach(group => {
        let names = group.innerHTML.split('<br>');
        names = names.filter(name => name.trim() != '');
        // remove <p> and </p> tags from names
        names = names.map(name => name.replace('<p>', '').replace('</p>', ''));
        allocation.push(names);
    });
    return allocation;
}

/**
 * checkSavedAllocation()
 * - check if there's a saved allocation in local storage
 * - if there isn't set the button#loadAllocation to hidden 
 */

function checkSavedAllocation() {
    let allocation = localStorage.getItem('dj-group-generator');
    if (allocation == null) {
        document.querySelector('#loadAllocation').style.display = "none"; 
    }
}

/**
 * loadAllocation()
 * - load the saved allocation from local storage
 * - convert it from JSON to an array of arrays
 * - display the allocation
 */

function loadAllocation() {
    let allocation = localStorage.getItem('dj-group-generator');
    allocation = JSON.parse(allocation);
    let number = localStorage.getItem('dj-group-generator-number');
    document.querySelector('#Number').value = number;
    // clear out the content of #members and replace with the names from the allocation
    document.querySelector('#members').value = '';
    allocation.forEach(group => {
        group.forEach(name => {
            document.querySelector('#members').value += `${name}\n`;
        });
    });
    displayGroups(allocation);
}