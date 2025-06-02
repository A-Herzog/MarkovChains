/*
Copyright 2024 Alexander Herzog

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

export {isDesktopApp, initApp, changeSettings, changeMatrixValue, updateSize, startApp};

import {language} from "./Language.js";
import {formatNumber, getFloat} from "./NumberTools.js";
import {drawMarkovGraph, clearMarkovGraph} from "./MarkovGraph.js";

/**
 * Is the system running as Neutralions desktop app (true) or as a web page (false)?
 */
const isDesktopApp=(typeof(NL_OS)!='undefined');
if (isDesktopApp) {
  Neutralino.init();
  Neutralino.events.on("windowClose",()=>Neutralino.app.exit());
}

/**
 * Chart for showing the states as a function of time for the discrete case
 */
let chartStateDiscrete;

/**
 * Chart for showing the relative frequencies of the states for the discrete case
 */
let chartFrequenciesDiscrete;

/**
 * Chart for showing the states as a function of time for the continuous case
 */
let chartStateContinuous;

/**
 * Chart for showing the relative frequencies of the states for the continuous case
 */
let chartFrequenciesContinuous;

/**
 * Chart data for showing the states as a function of time for the discrete case
 */
const chartStateDiscreteData={};

/**
 * Chart data for showing the relative frequencies of the states for the discrete case
 */
const chartFrequenciesDiscreteData={};

/**
 * Chart data for showing the states as a function of time for the continuous case
 */
const chartStateContinuousData={};

/**
 * Chart data for showing the relative frequencies of the states for the continuous case
 */
const chartFrequenciesContinuousData={};

/**
 * Updates the size of a matrix table.
 * @param {String} id Id of the table
 */
function updateMatrix(id) {
  const table=document.getElementById("inputTable"+id);
  const newSize=parseInt(document.getElementById("numberOfStates"+id).value);

  /* Save old values */
  const oldValues=[];
  for (let i=1;i<=6;i++) for (let j=1;j<=6;j++) {
    const el=document.getElementById(id+"-"+i+"-"+j);
    if (el==null) continue;
    while (oldValues.length<i) oldValues.push([]);
    while (oldValues[i-1].length<j) oldValues[i-1].push(null);
    oldValues[i-1][j-1]=el.innerText;
  }

  /* Build new table */
  table.innerHTML="";
  for (let i=0;i<=newSize;i++) {
    const tr=document.createElement("tr");
    table.appendChild(tr);
    for (let j=0;j<=newSize;j++) {
      const td=document.createElement((i>0 || j>0)?"td":"th");
      tr.appendChild(td);
      if (i==0 || j==0) {
        td.style.backgroundColor=(document.documentElement.dataset.bsTheme=='dark')?"darkgray":"lightgray";
        td.style.textAlign="center";
        if (i==0 && j>0) td.innerHTML=j;
        if (j==0 && i>0) td.innerHTML=i;
      } else {
        td.setAttribute("contenteditable",true);
        td.oninput=()=>changeMatrixValue(id);
      }
      td.style.width=(j==0)?"25px":"100px";
      td.id=id+"-"+i+"-"+j;
    }
  }

  /* Fill with values */
  for (let i=0;i<newSize;i++) for (let j=0;j<newSize;j++) document.getElementById(id+"-"+(i+1)+"-"+(j+1)).innerText=(oldValues.length>i && oldValues[i].length>j)?oldValues[i][j]:"0";

  /* Update initial state box */
  const startSelectElement=document.getElementById("simulationStartSelect"+id);
  const oldStartValueStr=startSelectElement.value;
  const oldStartValue=(oldStartValueStr=='')?"1":parseInt(oldStartValueStr);
  startSelectElement.innerHTML="";
  for (let i=1;i<=newSize;i++) {
    const option=document.createElement("option");
    startSelectElement.appendChild(option);
    option.value=i;
    option.innerText=i;
    option.selected=(i==oldStartValue || (oldStartValue>newSize && i==1));
  }

  /* Update chart axis */
  if (id=='Discrete') {
    if (chartStateDiscrete) {
      chartStateDiscrete.options.scales.y.max=newSize+1;
      chartStateDiscrete.update();
    }
  } else {
    if (chartStateContinuous) {
      chartStateContinuous.options.scales.y.max=newSize+1;
      chartStateContinuous.update();
    }
  }

  /* Recalculate */
  changeMatrixValue(id);
}

/**
 * Generates a select box for selecting the number of states in the Markov chain.
 * @param {Object} parent Parent HTML element
 * @param {String} id ID of the new select box
 */
function addInputMatrix(parent, id) {
  /* Input line above the matrix */
  const div=document.createElement("div");
  parent.appendChild(div);

  const label=document.createElement("label");
  div.appendChild(label);
  label.innerHTML=language.GUI.numberOfStates+":&nbsp;";
  label.htmlFor="numberOfStates"+id;

  const select=document.createElement("select");
  div.appendChild(select);
  select.id="numberOfStates"+id;
  select.className="form-select me-3";
  select.style.display="inline-block";
  select.style.width="auto";
  for (let i=2;i<=6;i++) {
    const option=document.createElement("option");
    select.appendChild(option);
    option.value=i;
    option.innerText=i;
    option.selected=(i==4);
  }
  select.onchange=()=>changeSettings();

  const dropdown=document.createElement("div");
  div.appendChild(dropdown);
  dropdown.id="dropdownButton"+id;
  dropdown.className="dropdown";
  const button=document.createElement("button");
  dropdown.appendChild(button);
  dropdown.className="btn btn-sm btn-primary dropdown-toggle";
  dropdown.type="button";
  dropdown.dataset.bsToggle="dropdown";
  dropdown.innerHTML=language.GUI.fillMatrix.title;
  const ul=document.createElement("ul");
  dropdown.appendChild(ul);
  ul.className="dropdown-menu";
  for (let i=0;i<4;i++) {
    const li=document.createElement("li");
    ul.appendChild(li);
    const a=document.createElement("a");
    li.appendChild(a);
    a.className="dropdown-item";
    a.innerHTML=[language.GUI.fillMatrix.random,language.GUI.fillMatrix.unit,language.GUI.fillMatrix.zeros,language.GUI.fillMatrix.example][i];
    a.onclick=()=>fillMatrix(id,i);
  }

  /* Matrix */
  const table=document.createElement("table");
  div.appendChild(table);
  table.id="inputTable"+id;
  table.className="borders mt-3";

  /* Info lines below matrix */
  let info;
  div.appendChild(info=document.createElement("div"));
  info.id="inputInfo"+id;
  info.className="mt-3";
  div.appendChild(info=document.createElement("div"));
  info.id="inputInfo2"+id;
  info.className="mt-3";

  /* Start */
  updateMatrix(id);
}

/**
 * Example values for discrete Markov chain
 */
const discreteExampleValues=[[0.396,0.312,0.200,0.092],[0.242,0.179,0.267,0.312],[0.811,0.108,0.006,0.075],[0.088,0.458,0.318,0.136]];

/**
 * Example values for continuous Markov chain
 */
const continuousExampleValues=[[-164.0,87.0,53.0,24.0],[52.0,-187.0,63.0,72.0],[46.0,76.0,-128.0,6.0],[14.0,86.0,40.0,-140.0],];

/**
 * Fills a matrix.
 * @param {String} id Id of the table
 * @param {Number} mode Fill type (0: random, 1: unit matrix, 2: zero matrix)
 */
function fillMatrix(id, mode) {
  const numberOfStatesSelect=document.getElementById("numberOfStates"+id);
  if (mode==3) {
    numberOfStatesSelect.value=4;
    updateMatrix(id);
  }
  const size=parseInt(numberOfStatesSelect.value);

  if (mode==0) {
    /* Random */
    for (let i=0;i<size;i++) {
      let row=[];
      if (id=="Discrete") {
        for (let j=0;j<size;j++) row.push(Math.round(Math.random()*100)/100);
        const sum=row.reduce((a,b)=>a+b);
        row=row.map(cell=>cell/sum);
        row[row.length-1]=1-row.slice(0,row.length-1).reduce((a,b)=>a+b);
      } else {
        for (let j=0;j<size-1;j++) row.push(Math.round(Math.random()*100));
        const sum=row.reduce((a,b)=>a+b);
        row=[...row.slice(0,i), -sum, ...row.slice(i)];
      }
      for (let j=0;j<size;j++) document.getElementById(id+"-"+(i+1)+"-"+(j+1)).innerText=formatNumber(row[j]);
    }
  } else {
    for (let i=0;i<size;i++) for (let j=0;j<size;j++) {
      let value="";
      switch(mode) {
        case 1: /* Unit matrix */
          value=(i==j)?"1":"0";
          break;
        case 2: /* Zero matrix */
          value="0";
          break;
        case 3: /* Example values */
          value=(id=='Discrete')?discreteExampleValues[i][j]:continuousExampleValues[i][j];
          break;
      }
      document.getElementById(id+"-"+(i+1)+"-"+(j+1)).innerText=formatNumber(value);
    }
  }

  changeMatrixValue(id);
}

/**
 * Fills in the language strings to the GUI elements.
 */
function initGUILanguage() {
  /* Header */
  appName1.innerHTML=language.GUI.appName;
  languageButton.title=language.GUI.switchLanguageHint;
  languageButton.querySelector('.menuButtonTitleShort').innerHTML=language.GUI.switchLanguageShort;
  languageButton.querySelector('.menuButtonTitleLong').innerHTML=language.GUI.switchLanguage;
  languageButton.onclick=()=>{
    localStorage.setItem('selectedLanguage',language.GUI.switchLanguageMode);
    let url=PermaLink.href;
    url=url.substr(url.indexOf("?"));
    document.location.href=language.GUI.switchLanguageFile+url;
  }

  menuColorMode.title=language.GUI.tabColorMode;
  menuColorModeLight.innerHTML=language.GUI.tabColorModeLight;
  menuColorModeDark.innerHTML=language.GUI.tabColorModeDark;
  menuColorModeSystemDefault.innerHTML=language.GUI.tabColorModeSystemDefault;

  let selectedColorMode=localStorage.getItem('selectedColorMode');
  if (selectedColorMode==null) {
    menuColorModeSystemDefault.classList.add("bi-check");
    const mode=(document.documentElement.dataset.bsTheme=='dark')?language.GUI.tabColorModeDark:language.GUI.tabColorModeLight;
    menuColorModeSystemDefault.innerHTML=menuColorModeSystemDefault.innerHTML+" ("+mode+")";
  } else {
    if (document.documentElement.dataset.bsTheme=='dark') menuColorModeDark.classList.add("bi-check"); else menuColorModeLight.classList.add("bi-check");
  }

  /* Title */
  document.getElementsByTagName("h1")[0].innerHTML=language.GUI.appName;

  /* Content: Input area */
  infoAreaGeneral.innerHTML=language.GUI.markovInfo;
  modeSelectLabel.innerHTML=language.GUI.mode+":&nbsp;";
  modeSelect0.innerText=language.GUI.discrete.select;
  modeSelect1.innerText=language.GUI.continuous.select;
  modeSelect.onchange=()=>changeSettings();
  PermaLink.innerHTML=language.GUI.permalink;
  if (isDesktopApp) PermaLink.style.display="none";
  inputBoxDiscreteTitle.innerHTML=language.GUI.discrete.inputTitle;
  inputBoxContinuousTitle.innerHTML=language.GUI.continuous.inputTitle;
  addInputMatrix(inputBoxDiscrete,"Discrete");
  addInputMatrix(inputBoxContinuous,"Continuous");
  inputBoxContinuousAdditionalTitle.innerHTML=language.GUI.continuous.inputTitleAdditional;

  /* Content: Output area */
  outputBoxDiscreteTitle.innerHTML=language.GUI.simulation.title;
  outputBoxContinuousTitle.innerHTML=language.GUI.simulation.title;
  simulationStartSelectDiscreteLabel.innerHTML=language.GUI.simulation.startSelect+":&nbsp;";
  simulationStartSelectContinuousLabel.innerHTML=language.GUI.simulation.startSelect+":&nbsp;";
  resetButtonDiscrete.innerHTML=" "+language.GUI.simulation.buttonReset;
  resetButtonDiscrete.onclick=()=>clickReset("Discrete");
  stepButtonDiscrete.innerHTML=" "+language.GUI.simulation.buttonStep;
  stepButtonDiscrete.onclick=()=>clickStep("Discrete");
  playPauseButtonDiscrete.innerHTML=" "+language.GUI.simulation.buttonPlay;
  playPauseButtonDiscrete.onclick=()=>clickPlayPause("Discrete");
  resetButtonContinuous.innerHTML=" "+language.GUI.simulation.buttonReset;
  resetButtonContinuous.onclick=()=>clickReset("Continuous");
  stepButtonContinuous.innerHTML=" "+language.GUI.simulation.buttonStep;
  stepButtonContinuous.onclick=()=>clickStep("Continuous");
  playPauseButtonContinuous.innerHTML=" "+language.GUI.simulation.buttonPlay;
  playPauseButtonContinuous.onclick=()=>clickPlayPause("Continuous");
  boxCurrentStateDiscreteTitle.innerHTML=language.GUI.simulation.currentState;
  boxFrequenciesDiscreteTitle.innerHTML=language.GUI.simulation.frequencies;
  boxGraphDiscreteTitle.innerHTML=language.GUI.simulation.graph;
  boxCurrentStateContinuousTitle.innerHTML=language.GUI.simulation.currentState;
  boxFrequenciesContinuousTitle.innerHTML=language.GUI.simulation.frequencies;
  boxGraphContinuousTitle.innerHTML=language.GUI.simulation.graph;

  /* Content: Charts */
  const optionsLineDiscrete={
    animation: {duration: 0},
    scales: {
      x: {display: false},
      y: {min: 0, max: 5, title: {text: language.GUI.simulation.plotState, display: true}, ticks: {stepSize: 1, callback: value=>Math.round(value)}},
    },
    plugins: {legend: {display: false}}
  };
  const optionsLineContinuous={
    animation: {duration: 0},
    scales: {
      x: {display: false, type: 'linear'},
      y: {min: 0, max: 5, title: {text: language.GUI.simulation.plotState, display: true}, ticks: {stepSize: 1, callback: value=>Math.round(value)}},
    },
    plugins: {legend: {display: false}}
  };
  const optionsBar={
    animation: {duration: 0},
    scales: {
      y: {min: 0, max: 1, title: {text: language.GUI.simulation.plotRelativeFrequency, display: true}, ticks: {callback: value=>Math.round(value*100)+"%"}}
    },
    plugins: {legend: {display: false}}
  };
  chartStateDiscrete=new Chart(boxCurrentStateDiscrete,{type: 'line', data: chartStateDiscreteData, options: optionsLineDiscrete});
  chartFrequenciesDiscrete=new Chart(boxFrequenciesDiscrete,{type: 'bar', data: chartFrequenciesDiscreteData, options: optionsBar});
  chartStateContinuous=new Chart(boxCurrentStateContinuous,{type: 'line', data: chartStateContinuousData, options: optionsLineContinuous});
  chartFrequenciesContinuous=new Chart(boxFrequenciesContinuous,{type: 'bar', data: chartFrequenciesContinuousData, options: optionsBar});

  /* Tools */
  toolsInfo.innerHTML=language.GUI.tools.info;
  simButton.innerHTML=" "+language.GUI.mg1simulation.title;
  toolsPython.innerHTML=" "+language.GUI.tools.python;

  /* Footer */
  appName2.innerHTML=language.GUI.appName;
  linkImprint.innerHTML=language.GUI.imprint;
  linkPrivacy.innerHTML=language.GUI.privacy;
  linkMainHome.innerHTML=language.GUI.homeURL;
  linkMainHome.href="https://"+language.GUI.homeURL;
  infoLocalDataOnly2.querySelector("h3").innerHTML=language.GUI.privacyInfo1;
  infoLocalDataOnly2.querySelector("div").innerHTML=language.GUI.privacyInfo2;
  infoSimulators.innerHTML=language.GUI.simulators;
}

/**
   * Updates the permalink
   */
function updatePermaLink() {
  if (typeof(PermaLink)=='undefined') return;
  const mode=parseInt(modeSelect.value);
  let values;
  let size;
  let start;
  if (mode==0) {
    size=parseInt(numberOfStatesDiscrete.value);
    values=getTableValues("Discrete",size,null);
    start=parseInt(simulationStartSelectDiscrete.value);
  } else {
    size=parseInt(numberOfStatesContinuous.value);
    values=getTableValues("Continuous",size,null);
    start=parseInt(simulationStartSelectContinuous.value);
  }
  const matrix=(values==null)?"":values.map(row=>row.map(cell=>formatNumber(cell)).join(";")).join(";;");
  const url=document.location.protocol+"//"+document.location.host+document.location.pathname+"?mode="+mode+"&size="+size+"&matrix="+matrix+"&start="+start;

  PermaLink.href=url;
  menuColorModeLight.href=url;
  menuColorModeDark.href=url;
  menuColorModeSystemDefault.href=url;
}

/**
 * Callback function of updating the GUI after user changes.
 */
function changeSettings() {
  const mode=modeSelect.value;

  infoArea.innerHTML=(mode==0)?language.GUI.discrete.info:language.GUI.continuous.info;

  inputBoxDiscrete.style.display=(mode==0)?"":"none";
  inputBoxContinuous.style.display=(mode==0)?"none":"";
  inputBoxContinuousAdditional.style.display=(mode==0)?"none":"";

  outputRow1Discrete.style.display=(mode==0)?"":"none";
  outputRow2Discrete.style.display=(mode==0)?"":"none";

  outputRow1Continuous.style.display=(mode==0)?"none":"";
  outputRow2Continuous.style.display=(mode==0)?"none":"";

  updateMatrix("Discrete");
  updateMatrix("Continuous");

  updateSize("Discrete");
  updateSize("Continuous");
}

/**
 * Loads data from a table.
 * @param {String} id Id of the table
 * @param {Number} size Size of the table (data rows/cols without headers)
 * @param {Object}  errorInfo HTML node to show error messages in (can be null for no ouput)
 * @returns Double Array containing the table data
 */
function getTableValues(id, size, errorInfo) {
  const values=[];
  for (let i=0;i<size;i++) {
    const row=[];
    for (let j=0;j<size;j++) {
      const element=document.getElementById(id+"-"+(i+1)+"-"+(j+1));
      let text=element.innerText;
      if (text!=text.trim()) {
        text=text.trim();
        element.innerText=text;
      }
      const value=getFloat(text);
      if (value==null) {
        if (errorInfo!=null) {
          errorInfo.innerHTML=language.GUI.valueError.numberErrorA+(i+1)+language.GUI.valueError.numberErrorB+(j+1)+language.GUI.valueError.numberErrorC;
          errorInfo.style.color="red";
        }
        return null;
      }
      row.push(value);
    }
    values.push(row);
  }
  return values;
}

/**
 * Added the starting state to the set and also adds all possible following states.
 * @param {Array} values Matrix
 * @param {Number} state Starting state
 * @param {Set} followStates Set of the follow states
 */
function calcFollowStates(values, state, followStates) {
  followStates.add(state);
  for (let i=0;i<values[state].length;i++) {
    if (values[state][i]==0) continue;
    if (!followStates.has(i)) calcFollowStates(values,i,followStates);
  }
}

/**
 * Returns a set continaing all states the can follow on the given starting state.
 * @param {Array} values Matrix
 * @param {Number} state Starting state
 * @returns Set of all possible following states
 */
function getFollowStates(values, state) {
  const followStates=new Set();
  calcFollowStates(values,state,followStates);
  return followStates;
}

/**
 * Checks the matrix for irreducibility.
 * @param {Array} values Matrix
 * @returns Irreducibility text
 */
function checkIrreducibility(values) {
  /* Calcualte possible next states */
  const followStates=[];
  for (let i=0;i<values.length;i++) followStates.push(getFollowStates(values,i));

  const notGrouped=new Set(Array.from({length: values.length},(_,i)=>i));
  const groups=[];
  while (notGrouped.size>0) {
    /* Select next group starting state */
    const state=Array.from(notGrouped).reduce((a,b)=>Math.min(a,b));
    notGrouped.delete(state);
    const group=[state];
    groups.push(group);
    /* Check for all not grouped states reachability */
    let done=false;
    while (!done) {
      done=true;
      for (let i of notGrouped) if (followStates[state].has(i) && followStates[i].has(state)) {
        notGrouped.delete(i);
        group.push(i);
        done=false;
        break;
      }
    }
  }

  if (groups.length==1) {
    return language.GUI.connections.irreducible;
  } else {
    return language.GUI.connections.reducible+" ["+groups.map(g=>g.map(i=>i+1).join(";")).join("], [")+"].";
  }
}

/**
 * Callback when values in the table are changed.
 * @param {String} id Id of the table
 */
function changeMatrixValue(id) {
  /* Delete old output */
  const errorInfo=document.getElementById("inputInfo"+id);
  const irreducibilityInfo=document.getElementById("inputInfo2"+id);
  errorInfo.innerHTML="";
  errorInfo.style.color="";
  irreducibilityInfo.innerHTML="";
  inputAdditionalTableContinuous.innerHTML="";
  if (id=="Discrete") {
    matrixDiscrete=null;
    clearMarkovGraph(boxGraphDiscrete);
    if (chartStateDiscrete) {chartStateDiscreteData.datasets=[]; chartStateDiscrete.update();}
    if (chartFrequenciesDiscrete) {chartFrequenciesDiscreteData.datasets=[]; chartFrequenciesDiscrete.update();}
  } else {
    matrixContinuous=null;
    clearMarkovGraph(boxGraphContinuous);
    if (chartStateContinuous) {chartStateContinuousData.datasets=[]; chartStateContinuous.update();}
    if (chartFrequenciesContinuous) {chartFrequenciesContinuousData.datasets=[]; chartFrequenciesContinuous.update();}
  }
  document.getElementById("resetButton"+id).classList.add("disabled");
  document.getElementById("stepButton"+id).classList.add("disabled");
  document.getElementById("playPauseButton"+id).classList.add("disabled");

  /* Load values */
  const size=parseInt(document.getElementById("numberOfStates"+id).value);
  const values=getTableValues(id,size,errorInfo);
  if (values==null) return;

  /* Check values */
  for (let i=0;i<size;i++) {
    const row=values[i];
    const sum=row.reduce((a,b)=>a+b);
    if (id=="Discrete") {
      const min=row.reduce((a,b)=>Math.min(a,b));
      if (min<0) {
        errorInfo.innerHTML=language.GUI.valueError.row+" "+(i+1)+": "+language.GUI.valueError.discreteNotNegative;
        errorInfo.style.color="red";
        return;
      }
      if (Math.abs(sum-1)>0.000000001) {
        errorInfo.innerHTML=language.GUI.valueError.row+" "+(i+1)+": "+language.GUI.valueError.discreteSum1;
        errorInfo.style.color="red";
        return;
      }
    } else {
      if (sum!=0) {
        errorInfo.innerHTML=language.GUI.valueError.row+" "+(i+1)+": "+language.GUI.valueError.continuousSum0;
        errorInfo.style.color="red";
        return;
      }
      for (let j=0;j<size;j++) if (i==j) {
        if (row[j]>0) {
          errorInfo.innerHTML=language.GUI.valueError.row+" "+(i+1)+": "+language.GUI.valueError.continuousMainDiagonal;
          errorInfo.style.color="red";
        return;
        }
      } else {
        if (row[j]<0) {
          errorInfo.innerHTML=language.GUI.valueError.row+" "+(i+1)+": "+language.GUI.valueError.continuousOffMainDiagonal;
          errorInfo.style.color="red";
          return;
        }
      }
    }
  }
  if (id=="Discrete") {
    errorInfo.innerHTML=language.GUI.valueError.discreteOk;
  } else {
    errorInfo.innerHTML=language.GUI.valueError.continuousOk;
  }

  /* Check irreducibility */
  irreducibilityInfo.innerHTML=checkIrreducibility(values);

  /* Build jump chain matrix (in continuous mode) */
  if (id=="Continuous") {
    let jumpChain=structuredClone(values);
    jumpChain=jumpChain.map(row=>row.map(cell=>Math.max(0,cell)));
    for (let i=0;i<jumpChain.length;i++) {
      const sum=jumpChain[i].reduce((a,b)=>a+b);
      jumpChain[i]=jumpChain[i].map(cell=>cell/sum);
    }
    matrixContinuousJump=jumpChain;
    for (let i=0;i<=size;i++) {
      const tr=document.createElement("tr");
      inputAdditionalTableContinuous.appendChild(tr);
      for (let j=0;j<=size;j++) {
        const td=document.createElement("td");
        inputAdditionalTableContinuous.appendChild(td);
        if (i==0 || j==0) {
          td.style.backgroundColor=(document.documentElement.dataset.bsTheme=='dark')?"darkgray":"lightgray";
          td.style.textAlign="center";
          if (i==0 && j>0) td.innerHTML=j;
          if (j==0 && i>0) td.innerHTML=i;
        } else {
          td.innerHTML=formatNumber(jumpChain[i-1][j-1]);
        }
        td.style.width=(j==0)?"25px":"100px";
      }
    }
  }

  /* Prepare run */
  if (id=="Discrete") {
    matrixDiscrete=values;
    if (!chartFrequenciesContinuous) return;
  } else {
    matrixContinuous=values;
    if (!chartFrequenciesDiscrete) return;
  }
  document.getElementById("resetButton"+id).classList.remove("disabled");
  document.getElementById("stepButton"+id).classList.remove("disabled");
  document.getElementById("playPauseButton"+id).classList.remove("disabled");
  clickReset(id);
  updatePermaLink();
}

/**
 * Callback when Markov graph parent element is resized.
 * @param {String} id Id of the table
 */
function updateSize(id) {
  const canvas=document.getElementById("boxGraph"+id);
  const box=canvas.parentElement;
  if (Math.round(box.clientWidth*3/4)!=box.clientHeight) box.style.height=Math.round(box.clientWidth*3/4)+"px";
  canvas.style.width=box.clientWidth+"px";
  canvas.style.height=Math.round(box.clientWidth*3/4)+"px";
}

/**
 * Markov matrix for the discrete case
 */
let matrixDiscrete=null;

/**
 * Markov matrix for the continuous case
 */
let matrixContinuous=null;

/**
 * Jump chain markov matrix for the continuous case
 */
let matrixContinuousJump=null;

/**
 * Current state for the discrete case
 */
let currentStateDiscrete;

/**
 * Recorded states for the discrete case
 */
let statesDiscrete;

/**
 * Recorded absolute frequencies for the states in the discrete case
 */
let frequenciesDiscrete=null;

/**
 * Current state for the continuous case
 */
let currentStateContinuous;

/**
 * Recorded states for the continuous case
 */
let statesContinuous;

/**
 * Recorded time duration in the states for the continuous case
 */
let statesContinuousTime;

/**
 * Recorded absolute frequencies for the states in the continuous case
 */
let frequenciesContinuous=null;

/**
 * Outputs the current simulation data.
 * @param {String} id Id of the table
 * @param {Number} size Size of the Markov matrix
 * @param {Array} matrix Markov matrix
 * @param {Array} times Recorded time duration in the recorded states (is null in discrete case)
 * @param {Array} states Recorded states
 * @param {Array} frequencies Recorded absolute frequencies for the states
 * @param {Number} oldStateTime Time duration in old state (is not used in discrete case)
 * @param {Number} oldState Old state (can be -1)
 * @param {Number} newState New/current state
 */
function updateOutput(id, size, matrix, times, states, frequencies, oldStateTime, oldState, newState) {
  if (times!=null) {
    if (oldState>=0) {
      frequencies[oldState-1]+=oldStateTime;
      times.push(oldStateTime);
    }
    states.push(newState);
  } else {
    frequencies[newState-1]++;
    states.push(newState);
  }
  while (states.length>50) states.shift();

  const canvas=document.getElementById("boxGraph"+id);
  const sum=frequencies.reduce((a,b)=>a+b);
  const relFrequencies=(sum==0)?frequencies:frequencies.map(val=>val/sum);

  /* Update Markov graph */
  drawMarkovGraph(canvas,matrix,relFrequencies,oldState,newState);

  /* Update diagrams */
  if (id=="Discrete") {
    chartStateDiscreteData.labels=Array.from({length: 50},(_,k)=>k);
    const line=[];
    const points=[];
    chartStateDiscreteData.datasets=[{data: line, pointRadius: 0}, {data: points, borderWidth: 0, pointBorderColor: "red", pointBackgroundColor: "red", pointRadius: 5}];
    for (let i=0;i<states.length;i++) {
      if (i>0) line.push([i,states[i-1]]);
      line.push([i,states[i]]);
      points.push([i,states[i]]);
    }
    chartStateDiscrete.update();
    chartFrequenciesDiscreteData.labels=Array.from({length: size},(_,k)=>k+1);
    chartFrequenciesDiscreteData.datasets=[{data: relFrequencies, labels: Array.from({length: size},(_,k)=>k+1), borderWidth: 1, borderColor: "black"}];
    chartFrequenciesDiscrete.update();
  } else {
    chartStateContinuousData.labels=[];
    const line=[];
    const points=[];
    chartStateContinuousData.datasets=[{data: line, pointRadius: 0}, {data: points, borderWidth: 0, pointBorderColor: "red", pointBackgroundColor: "red", pointRadius: 5}];
    let t=0;
    for (let i=0;i<states.length;i++) {
      if (i>0) {
        t+=times[i-1];
        line.push([t,states[i-1]]);
      }
      line.push([t,states[i]]);
      points.push([t,states[i]]);
      points.push([t,states[i]]);
      chartStateContinuousData.labels.push(t);
      chartStateContinuousData.labels.push(t);
    }
    chartStateContinuous.update();
    chartFrequenciesContinuousData.labels=Array.from({length: size},(_,k)=>k+1);
    chartFrequenciesContinuousData.datasets=[{data: relFrequencies, labels: Array.from({length: size},(_,k)=>k+1), borderWidth: 1, borderColor: "black"}];
    chartFrequenciesContinuous.update();
  }
}

/**
 * Resets a simulation.
 * @param {String} id Id of the table
 */
function clickReset(id) {
  /* Load and initialize data */
  let size;
  let matrix;
  let currentState;
  let states;
  let times=null;
  let frequencies;
  if (id=="Discrete") {
    matrix=matrixDiscrete;
    size=matrix.length;
    currentState=currentStateDiscrete=parseInt(simulationStartSelectDiscrete.value);
    times=null;
    states=statesDiscrete=[];
    frequencies=frequenciesDiscrete=Array.from({length: size},()=>0);
  } else {
    matrix=matrixContinuous;
    size=matrix.length;
    currentState=currentStateContinuous=parseInt(simulationStartSelectContinuous.value);
    times=statesContinuousTime=[];
    states=statesContinuous=[];
    frequencies=frequenciesContinuous=Array.from({length: size},()=>0);
  }

  /* Update output */
  updateOutput(id,size,matrix,times,states,frequencies,0,-1,currentState);
}

/**
 * Generates a pseudo random number based on the exponential distribution.
 * @param {Number} lambda Distribution parameter lambda (lambda=1/expected value)
 * @returns Pseudo random number
 */
function getExpRandom(lambda) {
  /* F(x)=1-exp(-lambda*x) <=> x=-log(1-F(x))/lambda */
  return -Math.log(1-Math.random())/lambda;
}

/**
 * Performs a single simulation step.
 * @param {String} id Id of the table
 */
function clickStep(id) {
  /* Load data */
  let size;
  let matrix;
  let currentState;
  let currentStateTime;
  let times;
  let states;
  let frequencies;
  if (id=="Discrete") {
    matrix=matrixDiscrete;
    size=matrix.length;
    currentState=currentStateDiscrete;
    currentStateTime=null;
    times=null;
    states=statesDiscrete;
    frequencies=frequenciesDiscrete;
  } else {
    matrix=matrixContinuousJump;
    size=matrix.length;
    currentState=currentStateContinuous;
    currentStateTime=getExpRandom(-matrixContinuous[currentState-1][currentState-1]);
    times=statesContinuousTime;
    states=statesContinuous;
    frequencies=frequenciesContinuous;
  }

  /* Calculate new state */
  const row=matrix[currentState-1];
  const u=Math.random();
  let newState=row.length-1;
  let rowsum=0;
  for (let i=0;row.length;i++) {
    rowsum+=row[i];
    if (rowsum>=u) {newState=i+1; break;}
  }

  /* Update output */
  updateOutput(id,size,matrix,times,states,frequencies,currentStateTime,currentState,newState);

  /* Store global values */
  if (id=="Discrete") {
    currentStateDiscrete=newState;
  } else {
    currentStateContinuous=newState;
  }
}

/**
 * Timeouts for play mode
 */
const timeouts={Discrete: null, Continuous: null};

/**
 * Runs the next step in play mode.
 * @param {String} id Id of the table
 */
function initNextStep(id) {
  clickStep(id);
  timeouts[id]=setTimeout(()=>initNextStep(id),150);
}

/**
 * Starts or pauses the simulation.
 * @param {String} id Id of the table
 */
function clickPlayPause(id) {
  let isRunning=document.getElementById("stepButton"+id).classList.contains("disabled");

  if (isRunning) {
    /* Stop */
    if (timeouts[id]!=null) {clearTimeout(timeouts[id]); timeouts[id]=null;}
  } else {
    /* Start */
    initNextStep(id);
  }

  isRunning=!isRunning;
  modeSelect.disabled=isRunning;
  document.getElementById("numberOfStates"+id).disabled=isRunning;
  document.getElementById("dropdownButton"+id).classList.toggle("disabled",isRunning);
  for (let td of document.getElementById("inputTable"+id).getElementsByTagName("td")) td.setAttribute("contenteditable",!isRunning);
  document.getElementById("simulationStartSelect"+id).disabled=isRunning;
  document.getElementById("resetButton"+id).classList.toggle("disabled",isRunning);
  document.getElementById("stepButton"+id).classList.toggle("disabled",isRunning);
  const playPauseButton=document.getElementById("playPauseButton"+id);
  if (isRunning) {
    playPauseButton.classList.remove("bi-play");
    playPauseButton.classList.add("bi-pause");
    playPauseButton.innerHTML=" "+language.GUI.simulation.buttonPause;
  } else {
    playPauseButton.classList.remove("bi-pause");
    playPauseButton.classList.add("bi-play");
    playPauseButton.innerHTML=" "+language.GUI.simulation.buttonPlay;
  }
}

/**
 * Prepares the layout switcher which will remove the "loading..." text
 * and replace it with the app content.
 */
function startApp() {
  document.addEventListener('readystatechange',event=>{if (event.target.readyState=="complete") {
    if (isDesktopApp) {
      infoLocalDataOnly1.style.display="none";
      infoLocalDataOnly2.style.display="none";
    }
    mainContent.style.display="";
    infoLoading.style.display="none";
  }});
}

/**
 * Initializes the complete web app.
 */
function initApp() {
  initGUILanguage();
  fillMatrix("Discrete",3);
  fillMatrix("Continuous",3);
  simulationStartSelectDiscrete.value=2;
  simulationStartSelectContinuous.value=2;
  changeSettings();
  startApp();
}
