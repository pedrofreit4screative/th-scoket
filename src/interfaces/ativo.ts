export default interface Ativo {
  cod: string
  type: string
  volumes?: {
    mmneg?: number
    mmqtt?: number
    mmvtt?: number
    vtt?: number
    npr?: number
    nprmmneg?: number
    vpr?: number
    vprmmvtt?: number
  }
  minmax?: {
    minant?: number
    min14?: number
    min60?: number
    maxant?: number
    max14?: number
    max60?: number
    estoc60?: number
    maxmaxant?: number
    minminant?: number
    estochoje?: number
    amp?: number
    candle?: number
    ultmed?: number
    gapalta?: number
    gapbaixa?: number
  }
  intraday?: {
    fechora?: number
    varhora?: number
    minhora?: number
    maxhora?: number
    neg60?: number
    neghora?: number
    npr60?: number
    npr60mmnpr60?: number
    vtt60?: number
    vtthora?: number
    vpr60?: number
    vpr60mmvpr60?: number
    estochora?: number
  }
  estocastico?: {
    estoc14?: number
    estocD?: number
    estocD1?: number
    estocLento?: number
    estocLento1?: number
    cruzaEstoc?: number
  }
  bollingerBands?: {
    tdp?: number
    upper?: number
    middle?: number
  }
  pivotpoint?: {
    ppivotd?: number
    resum?: number
    resdois?: number
    restres?: number
    supumf?: number
    supdoisf?: number
    resumf?: number
    resdoisf?: number
    ultsupum?: number
    supum?: number
    ultsupdois?: number
    supdois?: number
    ultsuptres?: number
    suptres?: number
    ultresum?: number
    ultresdois?: number
    ultrestres?: number
    ultsupumf?: number
    ultsupdoisf?: number
    ultsuptresf?: number
    ultresumf?: number
    ultresdoisf?: number
    ultrestresf?: number
    ppivot?: number
  }
  larry?: {
    mme9?: number
    mme9d1?: number
    mme9d2?: number
    mme9d3?: number
    viradaontem?: string
    start91Venda?: number
    statusVenda?: string
    distAtivacao91V?: number
    start91Compra?: number
    statusCompra?: string
    distAtivacao91C?: number
    virada?: string
  }
  didi?: {
    med3d1?: number
    med8d1?: number
    med20d1?: number
    med3?: number
    med8?: number
    med20?: number
    agulhadaOntem?: number
    operaDidi?: string
    agulhandoHoje?: number
  }
  ifr?: {
    ifr2?: number
    mme5?: number
    max2?: number
    min2?: number
    ifr2stop?: number
    ifr14?: number
    ifr21?: number
  }
  mediasmoveis?: {
    mma21?: number
    mma60?: number
    mma120?: number
    ultmm21?: number
    ultmm60?: number
    ultmm120?: number
  }
  trix?: {
    trixsete?: number
    trix74?: number
    sinal?: string
  }
  dr?: {
    rompimento?: string
    estocastico?: string
    trix?: string
  }
  adl?: {
    ult?: number
    valores?: number[]
    maior?: number
    menor?: number
    estocadl?: number
    minprice60?: number
    maxprice60?: number
    estocPrice?: number
    estoc_price_adl?: number
  }
  macd?: {
    macd?: number
    signal?: number
    histogram?: number
    histogramd1?: number
    hist_ult?: number
    viradaHistogram?: string
  }
  obv?: {
    valores?: number[]
    ult?: number
    maior?: number
    menor?: number
    estocobv?: number
    minprice60?: number
    maxprice60?: number
    estocPrice?: number
    estoc_price_obv?: number
  }
  cruzamentomedias?: {}
  fechant?: number
  neg?: number
  qtt?: number
  med?: number
  min?: number
  max?: number
  ult?: number
  abe?: number
  abeant?: number
}
