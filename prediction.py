import pandas as pd
import numpy as np
import lightgbm as lgb
import joblib
import numpy as np
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel




def getModel():
    currdirr = os.getcwd()
    def makeModel():
        print('Model not found, training model', flush=True)
        try:
            X_train_resampled = np.load(currdirr+'\\xtrainedresampled.npy')
            y_train_resampled = np.load(currdirr+'\\ytrainedresampled.npy')
        except Exception as e:
            print('Resampled data not found, training new model', flush=True)
            with open(currdirr+'\\trainingset.py') as f:
                code = f.read()
            exec(code)
            X_train_resampled = np.load(currdirr+'\\xtrainedresampled.npy')
            y_train_resampled = np.load(currdirr+'\\ytrainedresampled.npy')
        lgbm_params = {
        'subsample': 0.95, 
        'reg_lambda': 0.005623413251903491, 
        'reg_alpha': 1.0, 
        'num_leaves': 570, 
        'n_estimators': 550, 
        'min_data_in_leaf': 135, 
        'min_child_weight': 0.02, 
        'max_depth': 13, 
        'learning_rate': 0.015, 
        'feature_fraction': 0.85, 
        'colsample_bytree': 0.9, 
        'cat_smooth': 50, 
        'bagging_freq': 9, 
        'bagging_fraction': 0.85
        }
        lightgbm_model = lgb.LGBMClassifier(**lgbm_params, random_state=42, verbose=-1)
        lightgbm_model.fit(X_train_resampled, y_train_resampled)

        lightgbm_model.booster_.save_model('lightgbm_model.txt')
        return lgb.Booster(model_file=currdirr+'\\lightgbm_model.txt')
    if os.path.exists(currdirr+'\\lightgbm_model.txt'):
        print('Model found', flush=True)
        try:
            lgb.Booster(model_file=currdirr+'\\lightgbm_model.txt')
        except Exception as e:
            print('Model found but could not be loaded, training new one', flush=True)
            return makeModel()
        return  lgb.Booster(model_file=currdirr+'\\lightgbm_model.txt')
    else:
        print('Model not found, training model', flush=True)
        return makeModel()
        






currentdir = os.getcwd()
app = FastAPI()
model = getModel()
if os.path.exists(currentdir+'\\scaler.joblib') and os.path.exists(currentdir+'\\preprocessor.pkl'):
    print('Scaler and preprocessor found', flush=True)
    scale = joblib.load(currentdir+'\\scaler.joblib')
    preprocessor = joblib.load(currentdir+'\\preprocessor.pkl')
else:
    print('Scaler and preprocessor not found, running installer', flush=True)
    with open(currentdir+'\\installer.py') as f:
        code = f.read()
    exec(code)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class HealthInput(BaseModel):
    HeartDisease: str
    BMI: float
    Smoking: str
    AlcoholDrinking: str
    Stroke: str
    PhysicalHealth: float
    MentalHealth: float
    DiffWalking: str
    Sex: str
    AgeCategory: str
    Race: str
    Diabetic: str
    PhysicalActivity: str
    GenHealth: str
    SleepTime: float
    Asthma: str
    KidneyDisease: str
    SkinCancer: str


def preprocess(input_data_frame):
    
    bins = [0, 18.5, 24.9, 29.9, 34.9, 39.9, float('inf')]
    labels = ['Underweight', 'Normal weight', 'Overweight', 'Obesity I', 'Obesity II', 'Obesity III']
    
    input_data_frame['BMI_Category'] = pd.cut(input_data_frame['BMI'], bins=bins, labels=labels, right=False)
    
    input_data_frame['Diabetic'] = input_data_frame['Diabetic'].replace({
        'No, borderline diabetes': 'No',
        'Yes (during pregnancy)': 'Yes'
    })
    
    input_data_frame.drop(columns=['BMI','Sex'],inplace=True)
    
    ordinal_cols = ['BMI_Category', 'AgeCategory', 'Race', 'GenHealth']
    boolean_cols = ['HeartDisease', 'Smoking', 'AlcoholDrinking', 'Stroke', 'DiffWalking', 'Diabetic', 'PhysicalActivity', 'Asthma', 'KidneyDisease', 'SkinCancer']
   
    df_transformed = preprocessor.transform(input_data_frame)
   
    
    ohe_columns = preprocessor.named_transformers_['ohe'].get_feature_names_out(boolean_cols)
    final_columns = ordinal_cols + list(ohe_columns) + [col for col in input_data_frame.columns if col not in ordinal_cols + boolean_cols]
    
    df_encoded = pd.DataFrame(df_transformed, columns=final_columns)
    return df_encoded.drop('HeartDisease_Yes', axis=1) 

@app.post("/predict")
async def predict(input_data: HealthInput):
    try:   
        input_data = input_data.dict()
        input_data_frame = pd.DataFrame([input_data])
        
        processed_data = preprocess(input_data_frame)
        
        
        scaled_data = scale.transform(processed_data)
       
        
        predictions = model.predict(scaled_data)
        
        return {"predictions": predictions.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ready")
async def server_ready():
    if model != None and scale != None and preprocessor != None:
        return {"status": "ready"}
    else:
        return {"status": "not ready"}
