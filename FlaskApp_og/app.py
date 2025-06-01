import json
from flask import Flask, request, jsonify
import joblib  
import copy 
import pandas as pd

app = Flask(__name__)

models = {}
for model_name in [
    'Imports of goods and services (% of GDP)_rf',
    'Exports of goods and services (% of GDP)_rf',
    'GDP_Growth_rf',
    'General index_CPI_rf',
    'Unemployment Rate (%)_rf'
   
]:
    try:
        models[model_name] = joblib.load(f'{model_name}.pkl')  # ✅ use joblib.load
        print(f"✅ Loaded model: {model_name}")
    except Exception as e:
        print(f"❌ Failed to load model {model_name}: {e}")


# Base values hardcoded
BASE_ECONOMIC_DATA = {
    "Employemt_in_Agriculture (%)": 56,
    "Employment_in_Industry (%)": 25.12,
    "Employment_in_Services (%)": 18.88,
    "Labor force participation rate": 54.649,
    "Gross_Fiscal_Deficit": 4933.609934,
    "GDP_In_Billion_USD": 3572.08,
    "Per_Capita_in_USD": 2485,
    "Percentage_Growth ": 8.2,
    "GDP_Agri_Allied": 752736.3314,
    "GDP_Agriculture": 630540,
    "GDP_Industry": 1487533.362,
    "GDP_Mining_Quarrying": 108713.4926,
    "GDP_Manufacturing": 838540.6632,
    "GDP_Services": 3263196.276,
    "Agri_Allied_Share_GDP": 13.67765273,
    "Agriculture_Share_GDP": 12.02498597,
    "Industry - Share to Total GDP": 27.02897896,
    "Mining_Share_GDP": 1.975360539,
    "Manufacturing_Share_GDP": 15.23656445,
    "Services_Share_GDP": 59.29336831,
    "Agri_Allied_Growth": 1.791943339,
    "Agriculture_Growth": 3.904107783,
    "Industry_Growth": 3.12203981,
    "Mining_Growth": 0.429096398,
    "Manufacturing_Growth": 1.885447095,
    "Services_Growth": 6.585053589,
    "Food and beverages_CPI": 175.5,
    "Fuel and light_CPI": 181.5,
    "ALL COMMODITIES_WPI": 123.7,
    "FOOD ARTICLES_WPI": 119.1,
    "MANUFACTURES_WPI": 126.3,
    "Current account balance (BoP, current US$)":-31962287412
    
    
}
FEATURE_ORDER = list(BASE_ECONOMIC_DATA.keys())

BASE_PREDICTION_DATA = {
    "GDP_Growth": 4.956420431,
    "General index_CPI": 178.8,
    "Unemployment Rate (%)": 8.01,
    "Exports of goods and services (% of GDP)": 21.8482115,
    "Imports of goods and services (% of GDP)": 24.07363871
}

# POLICY FUNCTIONS

#economic_data = BASE_ECONOMIC_DATA.copy()

def apply_policy_1(economic_data, spending_adjustment, amount, timeframe):
    # Make the factor absurdly large for maximum effect
    factor = (amount / 10) * (timeframe ** 2)

    if spending_adjustment == "increase":
        economic_data["GDP_In_Billion_USD"] *= 1 + 2.5 * factor
        economic_data["Per_Capita_in_USD"] *= 1 + 2.0 * factor
        economic_data["Gross_Fiscal_Deficit"] *= 1 + 3.0 * factor
        economic_data["Food and beverages_CPI"] *= 1 + 2.5 * factor
        economic_data["Fuel and light_CPI"] *= 1 + 2.0 * factor
        economic_data["Employment_in_Services (%)"] *= 1 + 1.8 * factor
        economic_data["Current account balance (BoP, current US$)"] *= 1 - 2.5 * factor
        

        economic_data["Percentage_Growth "] += 7 * factor
        economic_data["Agri_Allied_Growth"] *= 1 + 7.5 * factor
        economic_data["Agriculture_Growth"] *= 1 + 5 * factor
        economic_data["Services_Growth"] *= 1 + 7.0 * factor


    elif spending_adjustment == "decrease":
        economic_data["GDP_In_Billion_USD"] *= 1 - 2.5 * factor
        economic_data["Per_Capita_in_USD"] *= 1 - 2.0 * factor
        economic_data["Gross_Fiscal_Deficit"] *= 1 - 3.0 * factor
        economic_data["Food and beverages_CPI"] *= 1 - 2.5 * factor
        economic_data["Fuel and light_CPI"] *= 1 - 2.0 * factor
        economic_data["Employment_in_Services (%)"] *= 1 - 1.8 * factor
        economic_data["Current account balance (BoP, current US$)"] *= 1 + 2.5 * factor


def apply_policy_2(economic_data, amount, timeframe):
    # amount is in billion USD
    P = amount
    M = timeframe
    factor = P * M

    # Directly attack top model features with extreme multipliers
    economic_data["GDP_In_Billion_USD"] *= 1 - 0.01 * factor  # 1% drop per billion
    economic_data["Per_Capita_in_USD"] *= 1 - 0.008 * factor
    economic_data["Gross_Fiscal_Deficit"] -= P * M  # remove deficit
    economic_data["Percentage_Growth "] -= 0.05 * factor
    economic_data["Agri_Allied_Growth"] *= 1 - 0.05 * factor
    economic_data["Services_Growth"] *= 1 - 0.06 * factor
    economic_data["Employment_in_Services (%)"] *= 1 - 0.03 * factor
    
    economic_data["Food and beverages_CPI"] *= 1 - 0.05 * factor
    economic_data["Fuel and light_CPI"] *= 1 - 0.05 * factor
    economic_data["Current account balance (BoP, current US$)"] *= 1 + 0.03 * factor
    

def apply_policy_3(economic_data, incentive_type, amount, timeframe):
    # Convert timeframe to multiplier with more aggressive scaling
    timeframe_multiplier = 15 if timeframe == "longterm" else 10
    
    # Calculate amount-based impact factors
    if amount <= 30:
        amount_factor = 1.5  # Strongest impact for small amounts
    elif amount <= 60:
        amount_factor = 1.2  # Medium impact
    else:
        amount_factor = 1.1  # Slightly reduced impact for large amounts
    
    # Calculate base impact factor with sigmoid scaling
    base_factor = (amount / 100) * timeframe_multiplier * amount_factor
    
    if incentive_type == "subsidies":
        # Direct GDP impacts with stronger scaling
        gdp_impact = economic_data["GDP_In_Billion_USD"] * 0.8 * base_factor
        economic_data["GDP_In_Billion_USD"] += gdp_impact
        
        # Per capita impact with direct percentage points
        per_capita_impact = economic_data["Per_Capita_in_USD"] * 0.6 * base_factor
        economic_data["Per_Capita_in_USD"] += per_capita_impact
        
        # Employment impact with direct percentage points
        employment_impact = 15 * base_factor
        economic_data["Employment_in_Services (%)"] += employment_impact
        
        # CPI impacts with controlled scaling
        cpi_factor = 0.15 * base_factor
        economic_data["Food and beverages_CPI"] *= (1 - cpi_factor)
        economic_data["Fuel and light_CPI"] *= (1 - cpi_factor * 0.8)
        
        # Trade balance impact
        trade_impact = economic_data["Current account balance (BoP, current US$)"] * 0.8 * base_factor
        economic_data["Current account balance (BoP, current US$)"] -= trade_impact
        
        # Sector-specific impacts
        manufacturing_impact = economic_data["GDP_Manufacturing"] * 0.7 * base_factor
        economic_data["GDP_Manufacturing"] += manufacturing_impact
        economic_data["Manufacturing_Share_GDP"] += (2.0 * base_factor)
        economic_data["Services_Share_GDP"] += (1.5 * base_factor)
        
        # Growth impacts with direct percentage points
        economic_data["Percentage_Growth "] += (8 * base_factor)
        economic_data["Agri_Allied_Growth"] += (5 * base_factor)
        economic_data["Services_Growth"] += (7 * base_factor)
        
    elif incentive_type == "tax_breaks":
        # Similar structure but with different multipliers
        gdp_impact = economic_data["GDP_In_Billion_USD"] * 0.6 * base_factor
        economic_data["GDP_In_Billion_USD"] += gdp_impact
        
        per_capita_impact = economic_data["Per_Capita_in_USD"] * 0.5 * base_factor
        economic_data["Per_Capita_in_USD"] += per_capita_impact
        
        employment_impact = 12 * base_factor
        economic_data["Employment_in_Services (%)"] += employment_impact
        
        cpi_factor = 0.12 * base_factor
        economic_data["Food and beverages_CPI"] *= (1 - cpi_factor)
        economic_data["Fuel and light_CPI"] *= (1 - cpi_factor * 0.8)
        
        trade_impact = economic_data["Current account balance (BoP, current US$)"] * 0.7 * base_factor
        economic_data["Current account balance (BoP, current US$)"] -= trade_impact
        
    elif incentive_type == "export_credits":
        # Strongest impact on trade-related metrics
        gdp_impact = economic_data["GDP_In_Billion_USD"] * 0.9 * base_factor
        economic_data["GDP_In_Billion_USD"] += gdp_impact
        
        per_capita_impact = economic_data["Per_Capita_in_USD"] * 0.7 * base_factor
        economic_data["Per_Capita_in_USD"] += per_capita_impact
        
        employment_impact = 18 * base_factor
        economic_data["Employment_in_Services (%)"] += employment_impact
        
        # Slight CPI increase due to export pressure
        cpi_factor = 0.08 * base_factor
        economic_data["Food and beverages_CPI"] *= (1 + cpi_factor)
        economic_data["Fuel and light_CPI"] *= (1 + cpi_factor * 0.8)
        
        # Positive impact on current account
        trade_impact = economic_data["Current account balance (BoP, current US$)"] * 0.9 * base_factor
        economic_data["Current account balance (BoP, current US$)"] += trade_impact



def apply_policy_4(economic_data, goods_category, amount, timeframe):
    # Increased base factor calculation with more aggressive scaling
    base_factor = (amount / 5) * (15 if timeframe == "longterm" else 8)

    if goods_category == "electronics":
        # Significantly increased impact multipliers
        economic_data["GDP_In_Billion_USD"] *= (1 + 1.0 * base_factor)
        economic_data["Per_Capita_in_USD"] *= (1 + 0.8 * base_factor)
        economic_data["GDP_Manufacturing"] *= (1 + 1.2 * base_factor)
        economic_data["Manufacturing_Share_GDP"] += (1.5 * base_factor)
        economic_data["Employment_in_Services (%)"] += (2.0 * base_factor)
        economic_data["Employment_in_Industry (%)"] += (1.5 * base_factor)
        economic_data["Fuel and light_CPI"] *= (1 + 0.5 * base_factor)
        economic_data["MANUFACTURES_WPI"] *= (1 + 0.4 * base_factor)
        economic_data["Current account balance (BoP, current US$)"] *= (1 + 1.0 * base_factor)

    elif goods_category == "agriculture":
        # Significantly increased impact multipliers
        economic_data["GDP_In_Billion_USD"] *= (1 + 0.8 * base_factor)
        economic_data["Per_Capita_in_USD"] *= (1 + 0.6 * base_factor)
        economic_data["GDP_Agriculture"] *= (1 + 1.5 * base_factor)
        economic_data["GDP_Agri_Allied"] *= (1 + 1.2 * base_factor)
        economic_data["Employemt_in_Agriculture (%)"] += (2.5 * base_factor)
        economic_data["Employment_in_Services (%)"] += (1.5 * base_factor)
        economic_data["Food and beverages_CPI"] *= (1 + 0.8 * base_factor)
        economic_data["FOOD ARTICLES_WPI"] *= (1 + 0.6 * base_factor)
        economic_data["Current account balance (BoP, current US$)"] *= (1 + 0.8 * base_factor)

    elif goods_category == "automobiles":
        # Significantly increased impact multipliers
        economic_data["GDP_In_Billion_USD"] *= (1 + 1.2 * base_factor)
        economic_data["Per_Capita_in_USD"] *= (1 + 1.0 * base_factor)
        economic_data["GDP_Manufacturing"] *= (1 + 2.0 * base_factor)
        economic_data["Manufacturing_Share_GDP"] += (2.5 * base_factor)
        economic_data["Industry - Share to Total GDP"] += (2.0 * base_factor)
        economic_data["Employment_in_Industry (%)"] += (3.0 * base_factor)
        economic_data["Employment_in_Services (%)"] += (2.0 * base_factor)
        economic_data["Fuel and light_CPI"] *= (1 + 1.0 * base_factor)
        economic_data["MANUFACTURES_WPI"] *= (1 + 0.8 * base_factor)
        economic_data["Current account balance (BoP, current US$)"] *= (1 + 1.2 * base_factor)

    elif goods_category == "general":
        # Significantly increased impact multipliers
        economic_data["GDP_In_Billion_USD"] *= (1 + 0.6 * base_factor)
        economic_data["Per_Capita_in_USD"] *= (1 + 0.5 * base_factor)
        economic_data["GDP_Manufacturing"] *= (1 + 0.8 * base_factor)
        economic_data["GDP_Agriculture"] *= (1 + 0.6 * base_factor)
        economic_data["GDP_Services"] *= (1 + 1.0 * base_factor)
        economic_data["Employment_in_Services (%)"] += (1.5 * base_factor)
        economic_data["Employment_in_Industry (%)"] += (1.0 * base_factor)
        economic_data["Employemt_in_Agriculture (%)"] += (0.8 * base_factor)
        economic_data["Food and beverages_CPI"] *= (1 + 0.4 * base_factor)
        economic_data["Fuel and light_CPI"] *= (1 + 0.4 * base_factor)
        economic_data["ALL COMMODITIES_WPI"] *= (1 + 0.3 * base_factor)
        economic_data["Current account balance (BoP, current US$)"] *= (1 + 0.6 * base_factor)


def apply_policy_5(economic_data, incentive_type, amount, timeframe):
    # More aggressive base factor calculation
    base_factor = (amount / 2) * (25 if timeframe == "longterm" else 12)

    if incentive_type == "tax_breaks":

        
        # Supporting economic indicators
        economic_data["GDP_In_Billion_USD"] *= (1 + 2.5 * base_factor)
        economic_data["Per_Capita_in_USD"] *= (1 + 2.2 * base_factor)
        economic_data["Employment_in_Services (%)"] += (3.5 * base_factor)
        economic_data["Employment_in_Industry (%)"] += (3.0 * base_factor)
        economic_data["Food and beverages_CPI"] *= (1 - 1.5 * base_factor)
        economic_data["Fuel and light_CPI"] *= (1 - 1.2 * base_factor)
        economic_data["Current account balance (BoP, current US$)"] *= (1 - 2.0 * base_factor)
        economic_data["GDP_Manufacturing"] *= (1 + 3.0 * base_factor)
        economic_data["Manufacturing_Share_GDP"] += (3.5 * base_factor)
        economic_data["Services_Share_GDP"] += (3.0 * base_factor)
        economic_data["Percentage_Growth "] += (5.0 * base_factor)
        economic_data["Services_Growth"] += (4.5 * base_factor)

    elif incentive_type == "manufacturing_subsidies":
        # Direct impact on target variables
        
        # Supporting economic indicators
        economic_data["GDP_In_Billion_USD"] *= (1 + 3.0 * base_factor)
        economic_data["Per_Capita_in_USD"] *= (1 + 2.5 * base_factor)
        economic_data["Employment_in_Services (%)"] += (4.0 * base_factor)
        economic_data["Employment_in_Industry (%)"] += (3.5 * base_factor)
        economic_data["Food and beverages_CPI"] *= (1 - 1.0 * base_factor)
        economic_data["Fuel and light_CPI"] *= (1 - 0.8 * base_factor)
        economic_data["Current account balance (BoP, current US$)"] *= (1 - 2.5 * base_factor)
        economic_data["GDP_Manufacturing"] *= (1 + 3.5 * base_factor)
        economic_data["Manufacturing_Share_GDP"] += (4.0 * base_factor)
        economic_data["Industry - Share to Total GDP"] += (3.5 * base_factor)
        economic_data["Percentage_Growth "] += (5.5 * base_factor)
        economic_data["Industry_Growth"] += (5.0 * base_factor)
        economic_data["Manufacturing_Growth"] += (5.5 * base_factor)

    elif incentive_type == "infrastructure_investment":
        
        # Supporting economic indicators
        economic_data["GDP_In_Billion_USD"] *= (1 + 3.5 * base_factor)
        economic_data["Per_Capita_in_USD"] *= (1 + 3.0 * base_factor)
        economic_data["Employment_in_Services (%)"] += (4.5 * base_factor)
        economic_data["Employment_in_Industry (%)"] += (4.0 * base_factor)
        economic_data["Food and beverages_CPI"] *= (1 - 0.8 * base_factor)
        economic_data["Fuel and light_CPI"] *= (1 - 0.6 * base_factor)
        economic_data["Current account balance (BoP, current US$)"] *= (1 - 3.0 * base_factor)
        economic_data["GDP_Services"] *= (1 + 4.0 * base_factor)
        economic_data["Services_Share_GDP"] += (4.5 * base_factor)
        economic_data["Percentage_Growth "] += (6.0 * base_factor)
        economic_data["Services_Growth"] += (5.5 * base_factor)
        economic_data["Labor force participation rate"] += (3.5 * base_factor)



def policy_input_1(policy_id, spending_adjustment, amount, timeframe):
    return {
        "policy_id": policy_id,
        "spending_adjustment": spending_adjustment,
        "amount": amount,
        "timeframe": timeframe
    }

def policy_input_2(policy_id, amount, timeframe):
    return {
        "policy_id": policy_id,
        "amount": amount,
        "timeframe": timeframe
    }

def policy_input_3(policy_id, incentive_type, amount, timeframe):
    return {
        "policy_id": policy_id,
        "incentive_type": incentive_type,
        "amount": amount,
        "timeframe": timeframe
    }

def policy_input_4(policy_id, goods_category, amount, timeframe):
    return {
        "policy_id": policy_id,
        "goods_category": goods_category,
        "amount": amount,
        "timeframe": timeframe
    }

def policy_input_5(policy_id, incentive_type, amount, timeframe):
    return {
        "policy_id": policy_id,
        "incentive_type": incentive_type,
        "amount": amount,
        "timeframe": timeframe
    }

def get_policy_result(data):
    policy_id = data.get("policy_id")
    timeframe = data.get("timeframe")
    amount = data.get("amount")

    if policy_id == 1:
        return policy_input_1(policy_id, data.get("spending_adjustment"), amount, timeframe)
    elif policy_id == 2:
        return policy_input_2(policy_id, amount, timeframe)
    elif policy_id == 3:
        return policy_input_3(policy_id, data.get("incentive_type"), amount, timeframe)
    elif policy_id == 4:
        return policy_input_4(policy_id, data.get("goods_category"), amount, timeframe)
    elif policy_id == 5:
        return policy_input_5(policy_id, data.get("incentive_type"), amount, timeframe)
    else:
        raise ValueError("Invalid policy ID")

@app.route('/post_policy', methods=['POST'])
def post_policy():
    data = request.get_json()
    result = get_policy_result(data)
    return jsonify(result)





def modify_economic_data(BASE_ECONOMIC_DATA, policy_json):

    economic_data = copy.deepcopy(BASE_ECONOMIC_DATA)
    policy_id = policy_json.get("policy_id")
    amount = policy_json.get("amount")
    td = policy_json.get("timeframe")
    timeframe = 0.8 if td == "shortterm" else 1.2
    

    if policy_id == 1:
        spending_adjustment = policy_json.get("spending_adjustment")
    
        apply_policy_1(economic_data, spending_adjustment, amount, timeframe)

    elif policy_id == 2:
        apply_policy_2(economic_data, amount, timeframe)

    elif policy_id == 3:
        incentive_type = policy_json.get("incentive_type")
        apply_policy_3(economic_data, incentive_type, amount, timeframe)

    elif policy_id == 4:
        goods_category = policy_json.get("goods_category")
        apply_policy_4(economic_data, goods_category, amount, timeframe)

    elif policy_id == 5:
        incentive_type = policy_json.get("incentive_type")
        apply_policy_5(economic_data, incentive_type, amount, timeframe)     
    
    else:
        raise ValueError("Unknown policy ID")
    
    return economic_data
# def modify_economic_data(BASE_ECONOMIC_DATA, policy_json):
#     economic_data = copy.deepcopy(BASE_ECONOMIC_DATA)
#     policy_id = policy_json.get("policy_id")
#     amount = policy_json.get("amount")
#     td = policy_json.get("timeframe")
#     timeframe = 0.8 if td == "shortterm" else 1.2
    
#     print(f"\n========== APPLYING POLICY {policy_id} ==========")
#     print(f"Amount: {amount}, Timeframe: {td} ({timeframe})")
    
#     # Store original values for comparison
#     original_values = copy.deepcopy(economic_data)

#     if policy_id == 1:
#         spending_adjustment = policy_json.get("spending_adjustment")
#         print(f"Spending Adjustment: {spending_adjustment}")
#         apply_policy_1(economic_data, spending_adjustment, amount, timeframe)

#     elif policy_id == 2:
#         apply_policy_2(economic_data, amount, timeframe)

#     elif policy_id == 3:
#         incentive_type = policy_json.get("incentive_type")
#         apply_policy_3(economic_data, incentive_type, amount, timeframe)

#     elif policy_id == 4:
#         goods_category = policy_json.get("goods_category")
#         apply_policy_4(economic_data, goods_category, amount, timeframe)

#     elif policy_id == 5:
#         incentive_type = policy_json.get("incentive_type")
#         apply_policy_5(economic_data, incentive_type, amount, timeframe)     
    
#     else:
#         raise ValueError("Unknown policy ID")
    
#     # Compare changes
#     print("\n========== FEATURE CHANGES AFTER POLICY APPLICATION ==========")
#     print("Feature Name | Original Value | New Value | Percent Change")
#     print("-" * 70)
    
#     for key in FEATURE_ORDER:
#         if key in original_values and key in economic_data:
#             orig_val = original_values[key]
#             new_val = economic_data[key]
            
#             if orig_val != 0:  # Avoid division by zero
#                 percent_change = ((new_val - orig_val) / abs(orig_val)) * 100
#                 print(f"{key[:25]:<25} | {orig_val:<15.4f} | {new_val:<15.4f} | {percent_change:+.2f}%")
#             else:
#                 print(f"{key[:25]:<25} | {orig_val:<15.4f} | {new_val:<15.4f} | N/A (orig=0)")
    
#     # Print model features that might be relevant
#     print("\n========== BASE PREDICTION VALUES ==========")
#     for key, value in BASE_PREDICTION_DATA.items():
#         print(f"{key}: {value}")
        
#     return economic_data

    
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    result = get_policy_result(data)
    modified_data = modify_economic_data(BASE_ECONOMIC_DATA, result)
    print("\n========== ORIGINAL BASE_ECONOMIC_DATA ==========")
    print(json.dumps(BASE_ECONOMIC_DATA, indent=2))

    print("\n========== MODIFIED ECONOMIC DATA AFTER POLICY ==========")
    print(json.dumps(modified_data, indent=2))   

    predictions = {}
    for name, model in models.items():
        try:
            input_vector = [modified_data[key] for key in FEATURE_ORDER]
            input_df = pd.DataFrame([input_vector], columns=FEATURE_ORDER)
            prediction = model.predict(input_df)  
            predictions[name] = prediction[0]  # Return scalar value
        except Exception as e:
            predictions[name] = f"Prediction error: {str(e)}"

    # Extract historical values using the correct keys
    historical = {
        "GDP_Growth_rf": BASE_PREDICTION_DATA["GDP_Growth"],
        "General index_CPI_rf": BASE_PREDICTION_DATA["General index_CPI"],
        "Unemployment Rate (%)_rf": BASE_PREDICTION_DATA["Unemployment Rate (%)"],
        "Exports of goods and services (% of GDP)_rf": BASE_PREDICTION_DATA["Exports of goods and services (% of GDP)"],
        "Imports of goods and services (% of GDP)_rf.pkl":BASE_PREDICTION_DATA["Imports of goods and services (% of GDP)"]
    }


    return jsonify({
        "predictions": predictions,
        "historical": historical
    })

    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

#host='0.0.0.0', port=5000, debug=True



        # economic_data["Imports of goods and services (% of GDP)"] *= (1 + 0.1 * P * M)
        # economic_data["Exports of goods and services (% of GDP)"] *= (1 + 0.08 * P * M)
        # economic_data["Per_Capita_in_USD"] *= (1 + 0.05 * P * M)
        # economic_data["Agri_Allied_Growth"] *= (1 + 0.2 * P * M)
        # economic_data["Agriculture_Growth"] *= (1 + 0.15 * P * M)
        # economic_data["Percentage_Growth "] *= (1 + 0.25 * P * M)  # More significant change
        # economic_data["Services_Growth"] *= (1 + 0.18 * P * M)
        # economic_data["Industry_Growth"] *= (1 + 0.12 * P * M)
        #     economic_data["Exports of goods and services (% of GDP)"] *= (1 - 0.08 * P * M)
        # economic_data["Imports of goods and services (% of GDP)"] *= (1 - 0.1 * P * M)
        # economic_data["Per_Capita_in_USD"] *= (1 - 0.05 * P * M)
        # economic_data["Agri_Allied_Growth"] *= (1 - 0.2 * P * M)
        # economic_data["Agriculture_Growth"] *= (1 - 0.15 * P * M)
        # economic_data["Percentage_Growth "] *= (1 - 0.25 * P * M)
        # economic_data["Services_Growth"] *= (1 - 0.18 * P * M)
        # economic_data["Industry_Growth"] *= (1 - 0.12 * P * M)