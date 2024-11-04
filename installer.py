
import numpy as np
import pandas as pd
import warnings 
import os
import joblib
warnings.filterwarnings('ignore')
currdir = os.getcwd()
fullpath = os.path.join(currdir, 'heart_2020_cleaned.csv')
df = pd.read_csv(fullpath)
df.drop_duplicates(inplace=True)





def remove_outliers_from_dataframe(df):
    
    for column in df.columns:
        if column in ['BMI', 'PhysicalHealth', 'MentalHealth', 'SleepTime']:
            Q1 = df[column].quantile(0.25)
            Q3 = df[column].quantile(0.75)
            IQR = Q3 - Q1
        
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
        
            df = df[(df[column] >= lower_bound) & (df[column] <= upper_bound)]
    return df

df=remove_outliers_from_dataframe(df)

bins = [0, 18.5, 24.9, 29.9, 34.9, 39.9, float('inf')]
labels = ['Underweight', 'Normal weight', 'Overweight', 'Obesity I', 'Obesity II', 'Obesity III']

df['BMI_Category'] = pd.cut(df['BMI'], bins=bins, labels=labels, right=False)



df_heart_disease = df[df['HeartDisease'] == 'Yes']


df['Diabetic'] = df['Diabetic'].replace({
    'No, borderline diabetes': 'No',
    'Yes (during pregnancy)': 'Yes'
})







df.drop(columns=['BMI','Sex'],inplace=True)



from sklearn.preprocessing import OrdinalEncoder, OneHotEncoder
from sklearn.compose import ColumnTransformer

ordinal_cols = ['BMI_Category', 'AgeCategory', 'Race', 'GenHealth']
boolean_cols = ['HeartDisease', 'Smoking', 'AlcoholDrinking', 'Stroke', 'DiffWalking', 'Diabetic', 'PhysicalActivity', 'Asthma', 'KidneyDisease', 'SkinCancer']

ordinal_mappings = {
    'BMI_Category': ['Underweight', 'Normal weight', 'Overweight', 'Obesity I', 'Obesity II', 'Obesity III'],
    'AgeCategory': ['18-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80 or older'],
    'Race': ['White', 'Black', 'Asian','Hispanic', 'American Indian/Alaskan Native', 'Other'],
    'GenHealth': ['Poor', 'Fair', 'Good', 'Very good', 'Excellent']
}


preprocessor = ColumnTransformer(
    transformers=[
        ('ord', OrdinalEncoder(categories=[ordinal_mappings[col] for col in ordinal_cols]), ordinal_cols), 
        ('ohe', OneHotEncoder(drop='first'), boolean_cols)  
    ],
    remainder='passthrough'  
)


df_transformed = preprocessor.fit_transform(df)
preprocessorpath = os.path.join(currdir, 'preprocessor.pkl')
joblib.dump(preprocessor, preprocessorpath)

ohe_columns = preprocessor.named_transformers_['ohe'].get_feature_names_out(boolean_cols)
final_columns = ordinal_cols + list(ohe_columns) + [col for col in df.columns if col not in ordinal_cols + boolean_cols]

df_encoded = pd.DataFrame(df_transformed, columns=final_columns)



X = df_encoded.drop('HeartDisease_Yes', axis=1)  
y = df_encoded['HeartDisease_Yes']


from sklearn.preprocessing import StandardScaler
scale = StandardScaler()
X_scaled= scale.fit_transform(X)

import joblib
scalerpath = os.path.join(currdir, 'scaler.joblib')
joblib.dump(scale, scalerpath)
 