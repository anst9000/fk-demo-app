<template>
    <h2>Sidlayout</h2>
    <p>
        De här komponenterna bygger upp en hel applikations ram, så de visas på egna sidor som
        fyller hela fönstret. Varje sida har en länk tillbaka hit.
    </p>

    <h3>FPageLayout</h3>
    <p>
        Delar fönstret i ytor: sidhuvud, vänster, innehåll, höger och sidfot. Det finns fyra
        färdiga layouter (<code>simple</code>, <code>left-panel</code>, <code>right-panel</code>
        och <code>three-column</code>), och på demosidan kan du byta mellan dem. Där visas också:
    </p>
    <ul>
        <li><code>FResizePane</code>: en sidopanel som användaren kan dra i storlek.</li>
        <li><code>FFixedPane</code>: en sidopanel med fast bredd.</li>
        <li><code>FMinimizablePanel</code>: en panel som kan minimeras till en smal list.</li>
        <li><code>FDetailsPanel</code>: visar detaljer om det man valt i listan.</li>
    </ul>
    <p><router-link :to="{ name: 'demo-fpagelayout' }">Öppna FPageLayout-demon</router-link></p>

    <h3>FLayoutApplicationTemplate</h3>
    <p>
        En äldre, fast mall med sidhuvud, toppnavigering, innehåll och sidfot, och med
        <code>FLayoutLeftPanel</code> och <code>FLayoutRightPanel</code> bredvid innehållet. Den
        högra panelen öppnas och stängs med <code>FLayoutRightPanelService</code>.
    </p>
    <p>
        <router-link :to="{ name: 'demo-applikationsmall' }">
            Öppna FLayoutApplicationTemplate-demon
        </router-link>
    </p>

    <h3>Felhantering och nätverk</h3>
    <p>
        Två komponenter ligger runt hela den här appen och syns bara när något händer:
        <code>FErrorHandlingApp</code> visar en felsida vid ett oväntat fel, och
        <code>FOffline</code> visar ett meddelande när nätverket försvinner. Båda kan provas på
        sidan <router-link :to="{ name: 'komp-aterkoppling' }">Återkoppling</router-link>.
    </p>
</template>
