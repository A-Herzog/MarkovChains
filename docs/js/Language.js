/*
Copyright 2023 Alexander Herzog

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

export {language};

let lang;

/* German */

const languageDE={};
lang=languageDE;

lang.GUI={};
lang.GUI.appName="Markovketten-Simulation";
lang.GUI.homeURL="warteschlangensimulation.de";
lang.GUI.imprint="Impressum";
lang.GUI.privacy="Datenschutz";
lang.GUI.privacyInfo1="Info";
lang.GUI.privacyInfo2="Alle Berechnungen laufen vollständig im Browser ab.<br>Diese Webapp führt nach dem Laden des HTML- und Skriptcodes keine weitere Kommunikation mit dem Server durch.";
lang.GUI.simulators="Simulatoren";

lang.GUI.switchLanguage="Switch to <b>English</b>";
lang.GUI.switchLanguageHint="Switch to English";
lang.GUI.switchLanguageShort="English";
lang.GUI.switchLanguageMode='default';
lang.GUI.switchLanguageFile="index.html";
lang.GUI.tabColorMode="Farbmodus";
lang.GUI.tabColorModeLight="Hell";
lang.GUI.tabColorModeDark="Dunkel";
lang.GUI.tabColorModeSystemDefault="Systemvorgabe";

lang.GUI.markovInfo=`
<p>
<strong>Stochastische Prozesse</strong> bestehen im Allgemeinen aus Zuständen und möglichen Übergängen zwischen diesen.
Soll ein Bediensystem als stochastischer Prozess modelliert werden, so stellt üblicherweise die aktuelle Anzahl an Kunden im System den Zustand des Systems dar;
durch eine Ankunft eines Kunden oder weil ein fertig bedienter Kunde das System verlässt, entstehen mögliche Übergänge zwischen den Zuständen.
Grafisch werden die Zustünde eines stochastischen Prozesses meist als kleine Kreise dargestellt. Die möglichen Übergänge werden dann durch Verbindungspfeile zwischen den Kreisen symbolisiert.
</p>
<p>
Eine <strong>Markov-Kette</strong> stellt eine besondere Form eines stochastischen Prozesses dar. Die Besonderheit bzw. Einschränkung gegenüber einem allgemeinen stochastischen Prozess
besteht darin, dass die Übergangswahrscheinlichkeiten von einem Zustand zu einem anderen nur von dem jeweiligen Zustand selbst abhängen (und nicht von der Vorgeschichte).
Bezogen auf ein Bediensystem bedeutet dies, dass die Übergangsraten zu dem Zustand "ein Kunde mehr" und zu dem Zustand "ein Kunde weniger" nur von dem aktuellen Zustand
abhängt - und nicht davon, in welchen Zuständen sich das System zu früheren Zeitpunkten befunden hat.
Jeder Zustand des Systems hängt in zeitlicher Hinsicht daher wie bei einer Kette nur an seinem unmittelbaren Vorgängerzustand.
(Der Name Markov-Kette hat folglich nichts mit der grafischen, d.h. räumlichen, Darstellung des Prozesses zu tun.)
Diese Bedingung an einen Markov-Prozess wird auch die <strong>Markov-Eigenschaft</strong> genannt.
</p>
<p>
Bei Markov-Prozessen wird unterschieden, zu welchen Zeitpunkten jeweils ein Übergang von einem Zustand zum nächsten erfolgen kann. Erfolgen diese Übergänge getaktet,
so spricht man von einer <strong>zeitdiskreten</strong> Markov-Kette. Die in jedem Zeitschritt erfolgenden Übergänge werden dann über eine Übergangswahrscheinlichkeitenmatrix
definiert. Können die Übergänge zu jedem beliebigen Zeitpunkt auftreten, so handelt es sich um eine <strong>zeitstetige</strong> Markov-Kette. In diesem Fall Können
keine einfachen Wahrscheinlichkeiten zur Beschreibung des Verhaltens verwendet werden, sondern es werden über eine sogenannte q-Matrix die Übergangsraten angegeben.
</p>
`;

lang.GUI.mode="Modus";
lang.GUI.permalink="Permalink zu diesen Einstellungen";
lang.GUI.numberOfStates="Anzahl an Zuständen";
lang.GUI.fillMatrix={};
lang.GUI.fillMatrix.title="Matrix ausfüllen";
lang.GUI.fillMatrix.random="Zufällig";
lang.GUI.fillMatrix.unit="Einheitsmatrix";
lang.GUI.fillMatrix.zeros="Nullmatrix";
lang.GUI.fillMatrix.example="Beispielwerte";

lang.GUI.valueError={};
lang.GUI.valueError.numberErrorA="Der Wert in Zeile ";
lang.GUI.valueError.numberErrorB=" und Spalte ";
lang.GUI.valueError.numberErrorC=" ist keine gültige Zahl."
lang.GUI.valueError.row="Zeile";
lang.GUI.valueError.discreteNotNegative="Die Matrix darf keine negativen Werte enthalten.";
lang.GUI.valueError.discreteSum1="Die Zeilensumme muss 1 betragen.";
lang.GUI.valueError.continuousSum0="Die Zeilensumme muss 0 betragen.";
lang.GUI.valueError.continuousMainDiagonal="Der Wert auf der Hauptdiagonalen muss kleiner als 0 sein.";
lang.GUI.valueError.continuousOffMainDiagonal="Die Werte außerhalb der Hauptdiagonalen müssen größer oder gleich 0 sein.";
lang.GUI.valueError.discreteOk="Die Übergangswahrscheinlichkeiten sind gültig.";
lang.GUI.valueError.continuousOk="Die Übergangsraten sind gültig.";

lang.GUI.discrete={};
lang.GUI.discrete.select="Zeitdiskret";
lang.GUI.discrete.info=`
<p><strong>Übergangswahrscheinlichkeiten</strong>: Hier wird festgelegt, wie die zu simulierende Markov-Kette aussieht: Die Anzahl der Zustände und die Übergangswahrscheinlichkeiten müssen eingegeben werden.</p>
<p><strong>Zustand in Abhängigkeit von der Zeit</strong> und <strong>Relative Häufigkeiten</strong>: Es wird angezeigt, welche Zustände die Markov-Kette einnimmt. Im Histogramm unten kann die relative Häufigkeit der einzelnen Zustände abgelesen werden.</p>
<p><strong>Markov-Graph</strong>: Der Graph wird angezeigt, die Zahlen an den Kanten geben die Übergangswahrscheinlichkeit an; die Zahlen an den Knoten sind die Wahrscheinlichkeiten, im Knoten zu bleiben. Der im aktuellen Simulationsschritt angenommene Zustand wird hervorgehoben, ebenso die zuletzt benutzte Kante. Die relative Häufigkeit der Zustände wird durch die Helligkeitsstufen dargestellt.</p>
`;
lang.GUI.discrete.inputTitle="Matrix der Übergangswahrscheinlichkeiten p<sub>i,j</sub>";

lang.GUI.continuous={};
lang.GUI.continuous.select="Zeitstetig";
lang.GUI.continuous.info=`
<p>Markov-Ketten in stetiger Zeit werden über ihre <strong>Q-Matrix</strong> beschrieben, diese wird auch als Generator- oder Ratenmatrix bezeichnet. Davon ausgehend, dass es nur endlich viele Zustände gibt, und keiner davon absorbierend ist, dass also jeder Zustand wieder verlassen werden kann, gilt für diese Matrix: Die Einträge außerhalb der Hauptdiagonalen sind nichtnegativ, die Einträge auf der Hauptdiagonalen sind negativ, die Zeilensummen haben den Wert 0.</p>
<p>Vor allem für die Simulation ist die folgende Interpretation der Einträge wichtig: Die <strong>Verweilzeit</strong> in einem Zustand ist exponentiell verteilt, der Parameter ist der Betrag des zugehörigen Hauptdiagonalelements. Nach Ablauf der Verweilzeit im Zustand i springt der Prozess in einen neuen Zustand, die Wahrscheinlichkeit für einen Sprung nach <em>j</em> lässt sich berechnen, indem die Rate <em>q<sub>ij</sub></em> für diesen Übergang durch |<em>q<sub>ii</sub></em>| geteilt wird. Die Wahrscheinlichkeit für einen Sprung in den gleichen Zustand ist 0, da die Verweilzeit abgelaufen ist.</p
<p>Werden die Verweilzeiten ignoriert, also nur die Sprünge betrachtet, ergibt sich eine Markov-Kette in diskreter Zeit, die <strong>eingebettete Sprungkette</strong>. Daher lässt sich eine Markov-Kette in stetiger Zeit mit endlich vielen nicht-absorbierenden Zuständen aus einer Markov-Kette in diskreter Zeit und einer Folge von exponentiell verteilten Verweilzeiten zusammensetzen.</p>
<p><strong>Übergangsraten</strong>: Hier wird festgelegt, wie die zu simulierende Markov-Kette aussieht: Die Anzahl der Zustände und die Übergangsraten müssen eingegeben werden. Unten wird automatisch die Übergangsmatrix der eingebetteten Sprungkette berechnet.</p>
<p><strong>Zustand in Abhängigkeit von der Zeit</strong> und <strong>Relative Häufigkeiten</strong>: Es wird angezeigt, welche Zustände die Markov-Kette einnimmt. Im Histogramm unten kann die relative Aufenthaltszeit in den einzelnen Zustände abgelesen werden.</p>
<p><strong>Markov-Graph</strong>: Der Graph wird angezeigt, die Zahlen an den Kanten geben die Übergangsraten an; die Zahlen an den Knoten sind die Parameter der exponentiell verteilten Verweilzeit. Der im aktuellen Simulationsschritt angenommene Zustand wird hervorgehoben, ebenso die zuletzt benutzte Kante. Die relative Aufenthaltsdauer in den Zuständen wird durch die Helligkeitsstufen dargestellt.</p>
`;
lang.GUI.continuous.inputTitle="Q-Matrix q<sub>i,j</sub>";
lang.GUI.continuous.inputTitleAdditional="Übergangsmatrix der eingebetteten Sprungkette";

lang.GUI.simulation={};
lang.GUI.simulation.title="Simulation";
lang.GUI.simulation.startSelect="Startzustand";
lang.GUI.simulation.buttonReset="Zurücksetzen";
lang.GUI.simulation.buttonStep="Einzelschritt";
lang.GUI.simulation.buttonPlay="Start";
lang.GUI.simulation.buttonPause="Pause";
lang.GUI.simulation.currentState="Zustand in Abhängigkeit von der Zeit";
lang.GUI.simulation.frequencies="Relative Häufigkeiten";
lang.GUI.simulation.graph="Markov-Graph";
lang.GUI.simulation.plotState="Zustand";
lang.GUI.simulation.plotRelativeFrequency="Relative Häufigkeit";


/* English */

const languageEN={};
lang=languageEN;

lang.GUI={};
lang.GUI.appName="Markov chain simulation";
lang.GUI.homeURL="queueingsimulation.de";
lang.GUI.imprint="Imprint";
lang.GUI.privacy="Privacy";
lang.GUI.privacyInfo1="Info";
lang.GUI.privacyInfo2="All calculations are performed entirely in the browser.<br>This Webapp does not perform any further communication with the server after loading the HTML and script code.";
lang.GUI.simulators="Simulators";

lang.GUI.switchLanguage="Auf <b>Deutsch</b> umschalten";
lang.GUI.switchLanguageHint="Auf Deutsch umschalten";
lang.GUI.switchLanguageShort="Deutsch";
lang.GUI.switchLanguageMode='de';
lang.GUI.switchLanguageFile="index_de.html";
lang.GUI.tabColorMode="Color mode";
lang.GUI.tabColorModeLight="Light";
lang.GUI.tabColorModeDark="Dark";
lang.GUI.tabColorModeSystemDefault="System default";

lang.GUI.markovInfo=`
<p>
In general, <strong>stochastic processes</strong> consist of states and possible transitions between them.
If a queueing system is to be modeled as a stochastic process, the current number of customers in the system usually represents the state of the system;
possible transitions between the states arise when a customer arrives or because a customer who has finished being served leaves the system.
Graphically, the states of a stochastic process are usually represented as small circles.
The possible transitions are then symbolized by connecting arrows between the circles.
</p>
<p>
A <strong>Markov chain</strong> is a special form of a stochastic process.
The special feature or restriction compared to a general stochastic process is that the transition probabilities from one state to another only depend on the respective state itself (and not on the previous history).
In relation to an queueing system, this means that the transition rates to the state "one more customer" and to the state "one less customer" only depend on the current state - and not on the states the system was in at earlier points in time.
Each state of the system therefore only depends on its immediate predecessor state in terms of time, as in a chain. (The name Markov chain therefore has nothing to do with the graphical, i.e. spatial, representation of the process.)
This condition on a Markov process is also called the <strong>Markov property</strong>.
</p>
<p>
In Markov processes, a distinction is made between the points in time at which a transition from one state to the next can occur.
If these transitions are clocked, this is referred to as a <strong>discrete-time</strong> Markov chain.
The transitions occurring at each time step are then defined using a transition probability matrix.
If the transitions can occur at any point in time, this is a <strong>continuous-time</strong> Markov chain.
In this case, no simple probabilities can be used to describe the behavior, but the transition rates are specified via a so-called q-matrix.
</p>
`;

lang.GUI.mode="Mode";
lang.GUI.permalink="Permalink to these settings";
lang.GUI.numberOfStates="Number of states";
lang.GUI.fillMatrix={};
lang.GUI.fillMatrix.title="Fill matrix";
lang.GUI.fillMatrix.random="Random";
lang.GUI.fillMatrix.unit="Unit matrix";
lang.GUI.fillMatrix.zeros="Zero matrix";
lang.GUI.fillMatrix.example="Example values";

lang.GUI.valueError={};
lang.GUI.valueError.numberErrorA="In row ";
lang.GUI.valueError.numberErrorB=" and column ";
lang.GUI.valueError.numberErrorC=" is no valid number."
lang.GUI.valueError.row="Row";
lang.GUI.valueError.discreteNotNegative="The matrix is not allowed to contain negative values.";
lang.GUI.valueError.discreteSum1="The line total has to be 1.";
lang.GUI.valueError.continuousSum0="The line total has to be 0.";
lang.GUI.valueError.continuousMainDiagonal="The value on the main diagonal has to be less than 0.";
lang.GUI.valueError.continuousOffMainDiagonal="The values outside the main diagonals have to be greater than or equal to 0.";
lang.GUI.valueError.discreteOk="The transition probabilities are valid.";
lang.GUI.valueError.continuousOk="The transition rates are valid.";

lang.GUI.discrete={};
lang.GUI.discrete.select="Discrete time";
lang.GUI.discrete.info=`
<p><strong>Transition probabilities</strong>: They determine how the Markov chain to be simulated looks like: The number of states and the transition probabilities have to be entered here.</p>
<p><strong>State as a function of time</strong> and <strong>Relative frequencies</strong>: The states of the Markov chain will be displayed here. The relative frequencies for each state can be read from the histogram below.</p>
<p><strong>Markov graph</strong>: The graph is displayed, the numbers on the edges give the transition probability; the numbers at the nodes are the chances to remain in the node. The current state in the current simulation step is highlighted, as well as the last-used edge. The relative frequency of the states are represented by the brightness levels.</p>
`;
lang.GUI.discrete.inputTitle="Matrix of the transition probabilities p<sub>i,j</sub>";

lang.GUI.continuous={};
lang.GUI.continuous.select="Continuous time";
lang.GUI.continuous.info=`
<p>Markov chains in continuous time are described by their <strong>Q matrix</strong>, this is also referred to as generator or rate matrix. Assuming that there are only finitely many states, and neither of them is absorbent, i.e. that each state can be exited again, applies to this matrix: The entries outside the main diagonal are non-negative, the entries on the main diagonal are negative, have the row sums to 0.</p>
<p>Especially for the simulation the following interpretation of the entries is important: the <strong>residence time</strong> in a condition is exponentially distributed, the parameter is the amount of the associated main diagonal element. After the dwell time in the state i, the process jumps to a new state, the probability of a transition to j can be calculated by the rate <em>q<sub>ij</sub></em> divied by |<em>q<sub>ii</sub></em>|. The probability for a jump in the same state is 0, because the residence time has been expired.</p>
<p>If the residence times are ignored, i.e. only the jumps are considered, there is a Markov chain in discrete time, the <strong>embedded jump chain</strong>. Therefore, can a Markov chain in continuous time with a finite number of non-absorbing states can be composed from a Markov chain in discrete time and a series of exponentially distributed residence times.</p>
<p><strong>Transition rates</strong>: They determine how the Markov chain to be simulated looks like: The number of states and the transition rates has to be entered. Below this the transition matrix of the embedded jump chain is automatically calculated.</p>
<p><strong>State as a function of time</strong> and <strong>Relative frequencies</strong>: The states of the Markov chain will be displayed here. The relative frequencies for each state can be read from the histogram below.</p>
<p><strong>Markov graph</strong>: The graph is displayed, the numbers on the edges give the transition probability; the numbers at the nodes are the parameters of the exponential distributed residence times. The current state in the current simulation step is highlighted, as well as the last-used edge. The relative frequency of the states are represented by the brightness levels.</p>
`;
lang.GUI.continuous.inputTitle="Q matrix q<sub>i,j</sub>";
lang.GUI.continuous.inputTitleAdditional="Transition matrix of the embedded jump chain";

lang.GUI.simulation={};
lang.GUI.simulation.title="Simulation";
lang.GUI.simulation.startSelect="Initial state";
lang.GUI.simulation.buttonReset="Reset";
lang.GUI.simulation.buttonStep="Single step";
lang.GUI.simulation.buttonPlay="Start";
lang.GUI.simulation.buttonPause="Pause";
lang.GUI.simulation.currentState="State as a function of time";
lang.GUI.simulation.frequencies="Relative frequencies";
lang.GUI.simulation.graph="Markov graph";
lang.GUI.simulation.plotState="State";
lang.GUI.simulation.plotRelativeFrequency="Relative frequency";

/* Activate language */

const language=(document.documentElement.lang=='de')?languageDE:languageEN;
