This is still the very beginning and not much has been done.

What has been done?

Dataset and Model Training:

  Process:

    This sequence is optimized for extreme accuracy, cleanliness, and model stability, ensuring that actions like visualization and cleaning happen at the exact moments required to prevent data leakage.
    
    1. Environment Setup & Library Imports
    
    Purpose: Establish a clean workspace and load the required computational engines.
    
    Action: Import data manipulation tools (`pandas`, `numpy`), visualization suites (`matplotlib`, `seaborn`, `plotly`), and utility packages (`os`, `warnings`). Keep modeling packages (`scikit-learn`, `xgboost`) isolated to prevent namespace clutter.
    
    
    
    2. Dataset Ingestion (Loading)
    
    Purpose: Securely bring raw data into the environment.
    
    Action: Load datasets from local storage, user uploads, or mounted cloud storage (like Google Drive) into a structured DataFrame.
    
    
    
    3. Initial Structural Exploration
    
    Purpose: Understand the dimensions and basic health of the raw data.
    
    Action: Run structural checks using `.shape`, `.info()`, and `.describe(include='all')`. Identify data types, column names, and check if numerical variables have been misclassified as text/objects due to formatting errors.
    
    
    
    4. High-Level Data Cleaning (The Cleanliness Layer)
    
    Purpose: Enforce uniform data integrity before analyzing relationships.
    
    Action: Remove duplicate rows, correct inconsistent formatting (such as lowercasing categorical labels like "Rain" and "rain"), and handle glaring syntax errors.
    
    
    5. Exploratory Data Analysis (EDA) & Visualization
    
    Purpose: Use your visual toolkit to discover underlying distributions, patterns, and anomalies.
    
    Action: Deploy Correlation Heatmaps to flag highly correlated features (multicollinearity).
    Use Strip Plots and Bar Charts to contrast categorical data against numerical spreads.
    Utilize Joint Plots to review central scatter trends and individual marginal distributions simultaneously.
    
    
    
    
    6. Feature & Label Isolation
    
    Purpose: Formally separate your predictors from the objective target.
    
    Action: Divide your dataset into the feature matrix (X) containing your independent variables and the target vector (y) containing your label.
    
    
    
    7. Strategic Train-Test Split
    
    Purpose: Create a completely isolated evaluation set to guarantee real-world model stability.
    
    Action: Partition your $X$ and $y$ data into Training sets (70\% - 80\%) and Testing sets (20\% - 30\%).
    
    Stability Note: This step must occur before scaling, encoding, or oversampling to avoid data leakage.
    
    
    
    8. Handling Missing Values & Outliers
    
    Purpose: Prevent algorithm crashes and mathematical distortions.
    
    Action: Impute missing values using the training set median (for numerical data) or mode (for categorical data). Detect and handle extreme outliers using methods like the Interquartile Range (IQR) to normalize feature variance.
    
    
    
    9. Feature Engineering & Distribution Formatting
    
    Purpose: Synthesize new insights and transform data into mathematically optimal structures.
    
    Action: Create domain-specific features (e.g., ratios, aggregations). Correct heavily skewed data distributions by applying mathematical transformations like Log or Box-Cox transforms.
    
    
    
    10. Categorical Encoding & Numerical Scaling
    
    Purpose: Convert all features into a uniform numerical format that algorithms can process.
    
    Action: Apply One-Hot Encoding or Target Encoding to categorical columns.
    Apply StandardScaler or MinMaxScaler to numerical columns.
    
    Execution: `.fit_transform()` only on the training set, and use `.transform()` on the test set.
    
    
    
    11. Addressing Class Imbalance (Oversampling)
    
    Purpose: Prevent the model from being biased toward a dominant majority class.
    
    Action: Apply synthetic generation techniques like SMOTE exclusively to the training sets ($X_{train}, y_{train}$). Save this transformed iteration distinctly (e.g., `X_train_resampled.csv`) to keep a clean audit trail, leaving the test data untouched.
    
    
    
    12. Model Selection & Baseline Training
    
    Purpose: Establish an initial performance benchmark.
    
    Action: Train baseline variations of candidate algorithms (e.g., Logistic Regression, Random Forests, Gradient Boosting) on your processed training data.
    
    
    
    13. Hyperparameter Tuning & Cross-Validation
    
    Purpose: Optimize internal algorithmic settings for peak accuracy.
    
    Action: Run $k$-Fold Cross-Validation combined with tuning strategies like `RandomizedSearchCV` or `GridSearchCV` to find the most stable configuration without overfitting.
    
    
    
    14. Comprehensive Model Evaluation
    
    Purpose: Judge performance using unbiased test data across multiple practical metrics.
    
    Action: Generate predictions on the isolated test set. Evaluate classification performance using a Confusion Matrix, Precision, Recall, F1-Score, and ROC-AUC curves. For regression tasks, check RMSE and $R^2$.
    
    
    
    
    15. Post-Model Diagnostics & Visualization
    
    Purpose: Double-check the logic of the model's decision-making process.
    
    Action: Plot a Confusion Matrix Heatmap to visually pinpoint error distribution. 
    
    Generate Feature Importance Plots to verify that the model is prioritizing logical features rather than data noise.
    
    
    
    16. Final Summary Report & Documentation
    
    Purpose: Consolidate data discoveries and engineering choices into actionable insights.
    
    Action: Outline the core transformations used, record baseline vs. final tuned performance metrics, identify model limitations, and document deployment recommendations.


This was the exact process used to get the best model after preparing a clean and structured dataset to be ready for deployment and have been saved as cleaned_heart_data.csv and heart_disease_model.pkl.

Issues:

1. Connecting the website and heart_disease_uci.csv. Need to finish this part.
2. Simple UI issues like arrows.
3. Saving data taken from website when analysing risk into heart_disease_uci.csv.
