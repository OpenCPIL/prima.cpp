// Generated from the audited HY4 model-name EOS timing record.
// Each event is [seconds since request start, seconds since previous token, exact SSE delta, tokenizer token ID].
// The final EOS token has an empty content delta and still counts toward the measured 96-token total.
export const hy4ReplayData = {
  schema: "prima.web.hy4-token-replay.v2",
  sourceSchema: "prima.hy4.model-name-eos-token-timing.v1",
  sourceBundle: "/tmp/hy4-prompt-search-20260828-a2/results/model-name-eos-a5",
  sourceFiles: {
    "request-01.json": "34fd3515c43dfa11e57a6bc9edb6a3180de66c9941d4590d606cb0f4e826552d",
    "prima-2p-model-name-eos-a5-token-timing.json": "4668d3ab6e04cd891014f3328aa963cd7a8a722582fb6bbdd5b6a339a5e168b7",
    "stream-journals/request-01-events.jsonl": "cbb438d771d431dcd1812e9d0db0ca3d0f781d91a72c7c3308d91f5badcc71e4",
  },
  eventUnit: "token",
  tokenizerTokenIdsAvailable: true,
  prompts: {
    "model-name": {
      requestIndex: 1,
      prompt: "What is your model name and what can you do for me?",
      output: "My name is Hunyuan, a large language model developed by Tencent. I can assist you with various tasks such as answering questions (covering general knowledge, science, technology, culture, etc.), providing information retrieval services, helping with text creation like writing stories or articles, and offering solutions to problems in different fields including but not limited to programming, education, and daily life. Whether you need factual answers, creative inspiration, or technical support, I'm here to help!",
      stopType: "eos",
      tokenCount: 96,
      results: {
        prima: {
          topology: "prima_2p",
          label: "Home Laptop + GPU server · PRIMA",
          captureStatus: "complete_eos",
          tokenCount: 96,
          ttftSeconds: 53.277147633,
          requestLevelAverageTpotSeconds: 1.31466909375,
          observedMeanInterTokenSeconds: 1.3282019307263158,
          observedMedianInterTokenSeconds: 1.181633275,
          tail10MedianInterTokenSeconds: 1.2515662905,
          tail20MedianInterTokenSeconds: 1.243296519,
          rank0InternalTpotSeconds: 1.25,
          maxInterTokenGapSeconds: 13.073693992,
          maxInterTokenGapOrdinal: 59,
          laterSteadyStateRegressionDetected: false,
          events: [[53.277147633,null,"My",5274],[54.520922438,1.243774805," name",2046],[55.780740923,1.259818485," is",341],[56.95540124,1.174660317," Hun",78365],[58.400044257,1.444643017,"yuan",54403],[59.695643627,1.29559937,",",11],[60.877140157,1.18149653," a",259],[62.124880458,1.247740301," large",3335],[63.534353437,1.409472979," language",4746],[64.784366678,1.250013241," model",1792],[65.803699592,1.019332914," developed",6873],[67.02619173,1.222492138," by",533],[68.083283486,1.057091756," T",344],[69.421294713,1.338011227,"encent",45813],[70.438473621,1.017178908,".",13],[71.530606945,1.092133324," I",356],[72.633909479,1.103302534," can",565],[73.905458892,1.271549413," assist",12824],[76.897123478,2.991664586," you",435],[78.054182277,1.157058799," with",430],[79.232002243,1.177819966," various",3623],[80.574489689,1.342487446," tasks",8140],[81.815960963,1.241471274," such",1451],[83.10345657,1.287495607," as",433],[84.255062529,1.151605959," answering",38903],[85.45757106,1.202508531," questions",5465],[86.654298736,1.196727676," (",347],[88.106423411,1.452124675,"cover",21505],[89.306102125,1.199678714,"ing",287],[90.073298615,0.76719649," general",3833],[91.224128294,1.150829679," knowledge",5297],[92.158097297,0.933969003,",",11],[93.22958131,1.071484013," science",8187],[94.366690312,1.137109002,",",11],[95.532749741,1.166059429," technology",5699],[96.543431017,1.010681276,",",11],[97.379725459,0.836294442," culture",7547],[98.320049158,0.940323699,",",11],[99.124851543,0.804802385," etc",4564],[100.283220121,1.158368578,".),",14858],[101.349186973,1.065966852," providing",7259],[102.5193013,1.170114327," information",2118],[103.745756979,1.226455679," retrieval",35539],[105.125740434,1.379983455," services",4779],[106.196804038,1.071063604,",",11],[107.116277682,0.919473644," helping",14931],[108.296513114,1.180235432," with",430],[109.577540625,1.281027511," text",2564],[110.819734271,1.242193646," creation",12151],[111.97398332,1.154249049," like",1322],[113.278900052,1.304916732," writing",6718],[114.22017773,0.941277678," stories",13639],[115.164155382,0.943977652," or",474],[116.365658361,1.201502979," articles",14162],[117.444681376,1.079023015,",",11],[118.412884851,0.968203475," and",303],[119.418714792,1.005829941," offering",13567],[120.330720199,0.912005407," solutions",5990],[133.404414191,13.073693992," to",302],[134.739238523,1.334824332," problems",4469],[135.898054391,1.158815868," in",297],[137.171219481,1.27316509," different",1653],[138.56968859,1.398469109," fields",6781],[139.916307938,1.346619348," including",3201],[141.187488732,1.271180794," but",857],[142.763345942,1.57585721," not",583],[144.224942002,1.46159606," limited",6939],[145.405937867,1.180995865," to",302],[146.633775541,1.227837674," programming",10557],[148.07948519,1.445709649,",",11],[149.33311804,1.25363285," education",6810],[150.423265507,1.090147467,",",11],[151.401505973,0.978240466," and",303],[152.515845787,1.114339814," daily",9539],[153.736504224,1.220658437," life",3025],[154.918137499,1.181633275,".",13],[156.085369285,1.167231786," Whether",16565],[157.525322513,1.439953228," you",435],[158.8978223,1.372499787," need",1265],[160.302505113,1.404682813," factual",75137],[161.663338582,1.360833469," answers",11378],[162.921214413,1.257875831,",",11],[164.099337459,1.178123046," creative",15909],[165.15129665,1.051959191," inspiration",31895],[166.180840867,1.029544217,",",11],[167.090829606,0.909988739," or",474],[168.152613703,1.061784097," technical",9451],[169.28657297,1.133959267," support",2200],[170.43772912,1.15115615,",",11],[171.434085979,0.996356859," I",356],[172.777462329,1.34337635,"'m",3283],[174.006179536,1.228717207," here",2376],[175.446865285,1.440685749," to",302],[176.747187096,1.300321811," help",2084],[178.02160247,1.274415374,"!",0],[179.456331052,1.434728582,"",120025]],
        },
      },
    },
  },
};
