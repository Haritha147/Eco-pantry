const fs = require('fs');
const { execSync } = require('child_process');

const appContent = execSync('git show HEAD:src/App.jsx', { encoding: 'utf8' });
const contextKeys = JSON.parse(fs.readFileSync('scratch/contextKeys.json', 'utf8'));
const allKeys = Object.keys(contextKeys).join(', ');

function extractBlock(startMarker, endMarker) {
    const startIdx = appContent.indexOf(startMarker);
    if (startIdx === -1) {
        console.warn('NOT FOUND: ' + startMarker);
        return '';
    }
    let endIdx = appContent.length;
    if (endMarker) {
      endIdx = appContent.indexOf(endMarker, startIdx);
      if (endIdx === -1) endIdx = appContent.length;
    }
    return appContent.slice(startIdx, endIdx);
}

// Blocks
const loginPageStr = extractBlock('if (!currentUser && authView === \'login\') {', '// 2. Logged Out: Render OTP Verification Page');
const loginJSX = loginPageStr.substring(loginPageStr.indexOf('return ('), loginPageStr.lastIndexOf('}')).replace(/^return \(/, '').replace(/\);?$/, '');

const verifyPageStr = extractBlock('if (!currentUser && authView === \'verify\') {', '// 3. Logged In: Render Main Application');
const verifyJSX = verifyPageStr.substring(verifyPageStr.indexOf('return ('), verifyPageStr.lastIndexOf('}')).replace(/^return \(/, '').replace(/\);?$/, '');

const dashboardStr = extractBlock('{/* Slide 1: Dashboard */}', '{/* Slide 2: Inventory Scanner */}');
const scannerStr = extractBlock('{/* Slide 2: Inventory Scanner */}', '{/* Slide 3: Smart Recipes */}');
const recipesStr = extractBlock('{/* Slide 3: Smart Recipes */}', '{/* Slide 4: Analytics */}');
const analyticsStr = extractBlock('{/* Slide 4: Analytics */}', '{/* Slide 5: User Profile & AI Settings */}');
const profileStr = extractBlock('{/* Slide 5: User Profile & AI Settings */}', '{/* Slide 6: Eco Community */}');
const communityStr = extractBlock('{/* Slide 6: Eco Community */}', '</main>');

const sidebarStr = extractBlock('{/* Sidebar */}', '{/* Main Content Area */}');
const recipeModalStr = extractBlock('{/* Recipe Modal Overlay */}', '{/* Floating AI Chatbot Widget */}');
const chatbotStr = extractBlock('{/* Floating AI Chatbot Widget */}', '{/* Donation Request Modal Overlay */}');
const donationModalStr = extractBlock('{/* Donation Request Modal Overlay */}', '{/* Edit Item Modal */}');
const editItemModalStr = extractBlock('{/* Edit Item Modal */}', '</div>\n  );\n}');

function writeComponent(path, name, jsx) {
    if(!jsx || !jsx.trim()) return;
    const content = `import React from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  LayoutDashboard, Camera, ChefHat, LineChart, Leaf, AlertCircle, Clock, Sparkles, Upload, 
  ArrowRight, Settings, Users, Activity, Award, User, Lock, Mail, ArrowLeft, CheckCircle, 
  RefreshCw, LogOut, TrendingUp, AlertTriangle, MessageSquare, Send, Mic 
} from 'lucide-react';

const ${name} = () => {
    const context = useAppContext();
    const { ${allKeys} } = context;

    return (
        <>
            ${jsx.trim()}
        </>
    );
};

export default ${name};
`;
    fs.writeFileSync(path, content);
}

function writePage(path, name, jsx) {
    if(!jsx || !jsx.trim()) return;
    const content = `import React from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  LayoutDashboard, Camera, ChefHat, LineChart, Leaf, AlertCircle, Clock, Sparkles, Upload, 
  ArrowRight, Settings, Users, Activity, Award, User, Lock, Mail, ArrowLeft, CheckCircle, 
  RefreshCw, LogOut, TrendingUp, AlertTriangle, MessageSquare, Send, Mic 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ${name} = () => {
    const context = useAppContext();
    const { ${allKeys} } = context;
    const navigate = useNavigate();

    return (
        <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
            ${jsx.trim().replace(/window\.location\.hash = '#([^']+)'/g, "navigate('/$1')").replace(/\/#/g, '/')}
        </div>
    );
};

export default ${name};
`;
    fs.writeFileSync(path, content);
}

writePage('src/pages/RecipesPage.jsx', 'RecipesPage', recipesStr);
writePage('src/pages/AnalyticsPage.jsx', 'AnalyticsPage', analyticsStr);
writePage('src/pages/ProfilePage.jsx', 'ProfilePage', profileStr);
writePage('src/pages/CommunityPage.jsx', 'CommunityPage', communityStr);

console.log('Missing pages extracted successfully.');
