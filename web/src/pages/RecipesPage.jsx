import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ChefHat, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecipesPage = () => {
    const { recipes, isGenerating, selectedRecipe, setSelectedRecipe, handleGenerateRecipes } = useAppContext();
    const navigate = useNavigate();

    return (
        <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
          <div>
            <h2 className="header-title">AI-Optimized "Zero-Waste" Recipes</h2>
            <p className="header-subtitle">Generative AI creates recipes based on ingredients nearing expiration.</p>
            
            <div className="recipe-grid">
              {isGenerating ? (
                <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '3rem' }}>
                  <div className="glass-loader"></div>
                  <div className="processing-text">Groq AI is Cooking...</div>
                </div>
              ) : (
                <>
                  {recipes.length > 0 ? recipes.map((recipe, index) => (
                    <div key={index} className="glass-panel recipe-card">
                       <div className="ai-badge"><Sparkles size={12} /> {recipe.matchScore}% Zero-Waste Match</div>
                      <h3 style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>{recipe.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        {recipe.description}
                      </p>
                      <button className="btn-primary" style={{ marginTop: 'auto' }} onClick={() => setSelectedRecipe(recipe)}>
                        View Recipe <ArrowRight size={16} />
                      </button>
                    </div>
                  )) : (
                    <div style={{ gridColumn: 'span 3', textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                      <ChefHat size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                      <p>No recipes generated. Let Groq AI create Zero-Waste recipes for you!</p>
                    </div>
                  )}

                  {!isGenerating && (
                    <div className="glass-panel recipe-card" style={{ border: '1px dashed var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', cursor: 'pointer' }} onClick={handleGenerateRecipes}>
                      <div style={{ color: 'var(--accent-teal)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={32} />
                        <strong>Generate with AI</strong>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
    );
};

export default RecipesPage;
