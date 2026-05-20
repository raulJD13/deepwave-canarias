# Risk modules — DeepWave Canarias

## Dataset

- Entrada: `/Users/rauljimenez/Development/Projects/AI-Projects/deep-wave-canarias/gold/multitarget_training_dataset`
- Filas: 983,328
- Columnas: 673
- Features usadas: 318
- Horizontes: [3, 6, 12, 24, 48]
- Módulos de riesgo: ['general', 'beach', 'navigation']
- XGBoost entrenado: False

## Modelos entrenados

- Total modelos directos: 15
- LightGBMClassifier: 15

## Recomendación por módulo y horizonte


### risk_general

- +3h: PhysicalDerivedRisk_LGBMPhysical (score=0.9375, macro_f1=0.9451, balanced_acc=0.9412, recall_c2=0.9260, recall_c3=0.9300)
- +6h: PhysicalDerivedRisk_LGBMPhysical (score=0.8772, macro_f1=0.8959, balanced_acc=0.8854, recall_c2=0.8651, recall_c3=0.8502)
- +12h: PhysicalDerivedRisk_LGBMPhysical (score=0.7591, macro_f1=0.8023, balanced_acc=0.7778, recall_c2=0.7637, recall_c3=0.6770)
- +24h: PersistenceRisk (score=0.5738, macro_f1=0.6201, balanced_acc=0.6198, recall_c2=0.5339, recall_c3=0.4871)
- +48h: PersistenceRisk (score=0.4404, macro_f1=0.4935, balanced_acc=0.4930, recall_c2=0.3981, recall_c3=0.3390)

### risk_beach

- +3h: PhysicalDerivedRisk_LGBMPhysical (score=0.6901, macro_f1=0.7735, balanced_acc=0.7725, recall_c2=0.7230, recall_c3=0.4714)
- +6h: PhysicalDerivedRisk_LGBMPhysical (score=0.6545, macro_f1=0.7365, balanced_acc=0.7331, recall_c2=0.6843, recall_c3=0.4431)
- +12h: PhysicalDerivedRisk_LGBMPhysical (score=0.5946, macro_f1=0.6739, balanced_acc=0.6654, recall_c2=0.6383, recall_c3=0.3866)
- +24h: PersistenceRisk (score=0.5173, macro_f1=0.5757, balanced_acc=0.5704, recall_c2=0.4965, recall_c3=0.3950)
- +48h: PersistenceRisk (score=0.4288, macro_f1=0.4763, balanced_acc=0.4710, recall_c2=0.4043, recall_c3=0.3350)

### risk_navigation

- +3h: PhysicalDerivedRisk_LGBMPhysical (score=0.8529, macro_f1=0.8732, balanced_acc=0.8707, recall_c2=0.7290, recall_c3=0.8811)
- +6h: PhysicalDerivedRisk_LGBMPhysical (score=0.7960, macro_f1=0.8174, balanced_acc=0.8141, recall_c2=0.6500, recall_c3=0.8356)
- +12h: PhysicalDerivedRisk_LGBMPhysical (score=0.7023, macro_f1=0.7228, balanced_acc=0.7163, recall_c2=0.5179, recall_c3=0.7702)
- +24h: PhysicalDerivedRisk_LGBMPhysical (score=0.5800, macro_f1=0.6011, balanced_acc=0.5905, recall_c2=0.3736, recall_c3=0.6638)
- +48h: PhysicalDerivedRisk_LGBMPhysical (score=0.4701, macro_f1=0.5006, balanced_acc=0.4903, recall_c2=0.2301, recall_c3=0.5509)