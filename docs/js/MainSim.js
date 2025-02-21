/*
Copyright 2025 Alexander Herzog

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

export {initApp};

import {language} from "./Language.js";
import {isDesktopApp, startApp} from './Main.js';
import {formatNumber, getNotNegativeFloat, getPositiveFloat} from "./NumberTools.js";

/**
 * Fills in the language strings to the GUI elements.
 */
 function initGUILanguage() {
	/* Header */
	appName1.innerHTML=language.GUI.mg1simulation.title;
		closeButton.title=language.GUI.mg1simulation.closeWindowShort;
	closeButton.querySelector('.menuButtonTitleShort').innerHTML=language.GUI.mg1simulation.closeWindowShort;
	closeButton.querySelector('.menuButtonTitleLong').innerHTML=language.GUI.mg1simulation.closeWindow;
	closeButton.onclick=()=>{
	  if (isDesktopApp) {
		/* Since we open this window in Neutralino.js via window.open, too, we have to use window.close() */
		/* Neutralino.window.hide(); */
		window.close();
	  } else {
		window.close();
	  }
	}

	/* Title */
	document.getElementsByTagName("h1")[0].innerHTML=language.GUI.mg1simulation.title;

	/* Info area */
	infoArea.innerHTML=language.GUI.mg1simulation.info;

	/* Input area */
	inputLambdaLabel.innerHTML=language.GUI.mg1simulation.arrivalRate+" &lambda;:=";
	inputLambda.value=formatNumber(0.85);
	inputMuLabel.innerHTML=language.GUI.mg1simulation.serviceRate+" &mu;:=";
	inputCVSLabel.innerHTML=language.GUI.mg1simulation.cvService+" CV[S]:=";
	selectSTypeLabel.innerHTML=language.GUI.mg1simulation.serviceDistribution+":";
	selectSTypeExp.innerText=language.GUI.mg1simulation.serviceDistributionExp;
	selectSTypeGamma.innerText=language.GUI.mg1simulation.serviceDistributionGamma;
	selectSTypeLogNormal.innerText=language.GUI.mg1simulation.serviceDistributionLogNormal;

	/* Buttons */
	resetButton.innerHTML=" "+language.GUI.simulation.buttonReset;
	stepButton.innerHTML=" "+language.GUI.simulation.buttonStep;
	playPauseButton.innerHTML=" "+language.GUI.simulation.buttonPlay;

  /* Diagrams */
  chart1header.innerHTML=language.GUI.mg1simulation.diagramClients;
  chart2header.innerHTML=language.GUI.mg1simulation.diagramServiceTimes;
}

/**
 * Displays information about the model parameters.
 * @param {String} text Status text do display
 * @param {Boolean} statusOk Are the model parameters valid?
 */
function errorInfo(text, statusOk) {
  inputInfo.style.color=statusOk?"":"red";
  inputInfo.innerHTML=text;

  stepButton.enabled=statusOk;
  playPauseButton.enabled=statusOk;
}

/** Input values for the simulation system */
let lambda;
let mu;
let cvS;
let serviceType;

/**
 * Callback for changed input values.
 */
function inputChanged() {
  inputLambdaInfo.innerHTML="";
  inputMuInfo.innerHTML="";

  lambda=getPositiveFloat(inputLambda.value);
  inputLambda.classList.toggle("is-invalid",lambda==null);
  if (lambda==null) {
    errorInfo(language.GUI.mg1simulation.arrivalRateError,false);
    return;
  }
  inputLambdaInfo.innerHTML="("+language.GUI.mg1simulation.arrivalRateAverage+" E[I]="+formatNumber(1/lambda)+".)";

  mu=getPositiveFloat(inputMu.value);
  inputMu.classList.toggle("is-invalid",mu==null || mu<=lambda);
  if (mu==null || mu<=lambda) {
    errorInfo(language.GUI.mg1simulation.serviceRateError,false);
    return;
  }
  inputMuInfo.innerHTML="("+language.GUI.mg1simulation.serviceRateAverage+" E[S]="+formatNumber(1/mu)+".)";

  cvS=getNotNegativeFloat(inputCVS.value);
  inputCVS.classList.toggle("is-invalid",cvS==null);
  if (cvS==null) {
    errorInfo(language.GUI.mg1simulation.cvServiceError,false);
    return;
  }

  serviceType=parseInt(selectSType.value);
  if (cvS!=1 && serviceType==0) {
    selectSType.value=1;
    serviceType=1;
  }

  errorInfo(language.GUI.mg1simulation.utilization+": &rho;="+formatNumber(lambda/mu*100)+"%.",true );
}

/**
 * Generates a pseudo-random number according to a specified distribution.
 * @param {Number} mean Expected value
 * @param {Number} cv Coefficient of variation
 * @param {Number} type Type of the distribution (0: exp, 1: gamma, 2: log-normal)
 * @returns Pseudo-random number
 */
function getRandom(mean, cv, type) {
  const sd=cv*mean;
  switch (type) {
    case 0: /* Exp */
      return jStat.exponential.sample(1/mean);
    case 1: /* Gamma */
      const b=mean/(sd**2);
      const p=mean**2/(sd**2);
      return jStat.gamma.sample(p,1/b);
    case 2: /* Lognormal */
      const mu=Math.log(mean)-1/2*Math.log(1+(cv**2));
      const sigma=Math.sqrt(Math.log(1+(cv**2)));
      return jStat.lognormal.sample(mu,sigma);
  }
  return 0;
}

/** Globale variables for the simulation */
let simTime=0;
let numberWaiting=0;
let customers=[];
let lastArrival=0;
let nextArrival=-1;
let doneService=-1;
let sumResidenceTime=0;
let countResidenceTime=0;
let historyT=[];
let historyCustomers=[];

/**
 * Number of clients diagram
 */
let chartClients;

/**
 * Service times diagram
 */
let chartService;

/**
 * Number of clients diagram data
 */
const chartClientsData={};

/**
 * Service times diagram data
 */
const chartServiceData={};

function clickReset() {
  simTime=0;
  numberWaiting=0;
  customers=[];
  lastArrival=0;
  nextArrival=-1;
  doneService=-1;
  sumResidenceTime=0;
  countResidenceTime=0;
  historyT=[];
  historyCustomers=[];

  chartClientsData.datasets=[];
  chartClients.update();
  chartServiceData.datasets=[];
  chartService.update();

 bottomInfo.innerHTML="";
}

/**
 * Performs a single simulation step.
 */
function clickStep() {
  /* Get next arrival time */
  if (nextArrival<0) nextArrival=lastArrival+getRandom(1/lambda,1,0);

  if (doneService>=0 && doneService<=nextArrival) {
    /* End of a service process */
    simTime=doneService;
    doneService=-1;
    const start=customers.shift();
    sumResidenceTime+=(simTime-start);
    countResidenceTime++;
    if (numberWaiting>0) {
      numberWaiting--;
      doneService=simTime+getRandom(1/mu,cvS,serviceType);
    }
  } else {
    /* Arrival of a customer */
    simTime=nextArrival;
    lastArrival=nextArrival;
    nextArrival=-1;
    customers.push(simTime);
    if (doneService>=0) numberWaiting++; else {
      doneService=simTime+getRandom(mu,cvS,serviceType);
    }
  }

  /* Update output */
  const customersInSystem=numberWaiting+((doneService>=0)?1:0);
  historyT.push(simTime);
  if (historyT.length>=100) historyT.shift();
  historyCustomers.push(customersInSystem);
  if (historyCustomers.length>=100) historyCustomers.shift();

  const points=[];
  const line=[];
  const service=[];
  const eps=0.000001;
  for (let i=0;i<historyT.length;i++) {
    const t=historyT[i];
    const last=(i==0)?0:historyCustomers[i-1];
    const current=historyCustomers[i];

    if (i>0) {
      line.push([t-eps,last]);
      points.push([t,current]);
    }
    line.push([t,current]);
    points.push([t,current]);

    if (current==0) {
      if (last>0) {service.push([t-eps,1]); service.push([t,0]);} else service.push([t,0]);
    } else {
      if (last==0) {service.push([t-eps,0]); service.push([t,1]);} else {
        if (last==current+1) {service.push([t-eps,1]); service.push([t,0]); service.push([t+eps,1]);} else service.push([t,1]);
      }
    }
  }

  chartClientsData.datasets=[{data: line, pointRadius: 0}, {data: points, borderWidth: 0, pointBorderColor: "red", pointBackgroundColor: "red", pointRadius: 5}];
  chartClientsData.labels=Array.from({length: 200},(_,k)=>k);
  chartClients.options.scales.y.max=historyCustomers.reduce((x,y)=>Math.max(x,y))+1;

  chartServiceData.labels=Array.from({length: 200},(_,k)=>k);
  chartServiceData.datasets=[{data: service, pointRadius: 0, borderColor: "#36A2EB", backgroundColor: "rgba(54,162,235,0.25)", fill: "origin"}];

  chartClients.update();
  chartService.update();

  bottomInfo.innerHTML=
  language.GUI.mg1simulation.time+': '+formatNumber(simTime)+'<br>'+
  language.GUI.mg1simulation.diagramClients+': '+customersInSystem+'<br>'+
  language.GUI.mg1simulation.averageResidenceTime+': '+formatNumber(sumResidenceTime/Math.max(countResidenceTime,1));
}

/**
 * Timeout for play mode
 */
let timeout=null;

/**
 * Runs the next step in play mode.
 */
function initNextStep() {
  clickStep();
  timeout=setTimeout(()=>initNextStep(),150);
}

/**
 * Starts or pauses the simulation.
 * @param {String} id Id of the table
 */
function clickPlayPause(id) {
  let isRunning=stepButton.classList.contains("disabled");

  if (isRunning) {
    /* Stop */
    if (timeout!=null) {clearTimeout(timeout); timeout=null;}
  } else {
    /* Start */
    initNextStep();
  }

  isRunning=!isRunning;
  inputLambda.disabled=isRunning;
  inputMu.disabled=isRunning;
  inputCVS.disabled=isRunning;
  selectSType.disabled=isRunning;
  resetButton.classList.toggle("disabled",isRunning);
  stepButton.classList.toggle("disabled",isRunning);
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
 * Init Web-App.
 */
function initApp() {
  initGUILanguage();

  /* Select color mode */
  let selectedColorMode=localStorage.getItem('selectedColorMode');
  if (selectedColorMode==null) selectedColorMode=(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)?"dark":"light";
  document.documentElement.dataset.bsTheme=selectedColorMode;

  /* Diagrams */
  const chartClientsOptions={
    animation: {duration: 0},
    scales: {
      x: {display: false, type: 'linear'},
      y: {min: 0, max: 5, title: {text: language.GUI.mg1simulation.diagramClients, display: true}, ticks: {stepSize: 1, callback: value=>Math.round(value)}},
    },
    plugins: {legend: {display: false}}
  };
  chartClients=new Chart(chart1canvas,{type: 'line', data: chartClientsData, options: chartClientsOptions});
  const chartServiceOptions={
    animation: {duration: 0},
    scales: {
      x: {display: false, type: 'linear'},
      y: {display: false, min: 0, max: 1.2},
    },
    plugins: {legend: {display: false}}
  };
  chartService=new Chart(chart2canvas,{type: 'line', data: chartServiceData, options: chartServiceOptions});

  /* Callbacks */
	inputLambda.oninput=()=>inputChanged();
	inputMu.oninput=()=>inputChanged();
	inputCVS.oninput=()=>inputChanged();
	selectSType.onchange=()=>inputChanged();
	inputChanged();
  resetButton.onclick=()=>clickReset();
  stepButton.onclick=()=>clickStep();
  playPauseButton.onclick=()=>clickPlayPause();

  /* Start */
  startApp();
}
