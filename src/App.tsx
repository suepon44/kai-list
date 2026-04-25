import { useState } from 'react';
import { ErrorBoundary, Header, Navigation, NAV_ITEMS, Page } from './components/common';
import { RecipeList } from './components/recipe';
import { WeeklyPlanView } from './components/meal-plan';
import { ShoppingListView } from './components/shopping-list';
import { StoreLayoutList } from './components/store-layout';
import { useRecipes } from './hooks/useRecipes';
import { useMealPlan } from './hooks/useMealPlan';
import { useShoppingList } from './hooks/useShoppingList';
import { useStoreLayout } from './hooks/useStoreLayout';
import './App.css';

/** タブIDから表示タイトルを取得する */
function getPageTitle(tabId: string): string {
  const item = NAV_ITEMS.find((nav) => nav.id === tabId);
  return item?.label ?? 'スマート買い物リスト';
}

function App() {
  const [activeTab, setActiveTab] = useState('recipes');

  // Hooks
  const {
    recipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
  } = useRecipes();

  const {
    currentPlan,
    assignRecipe,
    removeRecipe,
    savePlan,
    loadPlan,
    deletePlan,
    savedPlans,
    overwritePlan,
    resetPlan,
  } = useMealPlan();

  const {
    shoppingList,
    displayItems,
    displaySortedList,
    generate,
    sortByStore,
    toggleChecked,
    clearChecks,
    checkedItems,
    checkedCount,
    uncheckedCount,
  } = useShoppingList();

  const {
    storeLayouts,
    addStoreLayout,
    updateStoreLayout,
    deleteStoreLayout,
    allCategories,
    customCategories,
    addCustomCategory,
    deleteCustomCategory,
  } = useStoreLayout();

  const renderPage = () => {
    switch (activeTab) {
      case 'recipes':
        return (
          <RecipeList
            recipes={recipes}
            categories={allCategories}
            onAdd={addRecipe}
            onUpdate={updateRecipe}
            onDelete={deleteRecipe}
          />
        );
      case 'meal-plan':
        return (
          <WeeklyPlanView
            currentPlan={currentPlan}
            recipes={recipes}
            savedPlans={savedPlans}
            onAssignRecipe={assignRecipe}
            onRemoveRecipe={removeRecipe}
            onSavePlan={savePlan}
            onOverwritePlan={overwritePlan}
            onLoadPlan={loadPlan}
            onDeletePlan={deletePlan}
            onResetPlan={resetPlan}
          />
        );
      case 'shopping-list':
        return (
          <ShoppingListView
            currentPlan={currentPlan}
            recipes={recipes}
            storeLayouts={storeLayouts}
            hasShoppingList={shoppingList !== null}
            displaySortedList={displaySortedList}
            displayItems={displayItems}
            checkedItems={checkedItems}
            checkedCount={checkedCount}
            uncheckedCount={uncheckedCount}
            onGenerate={generate}
            onSortByStore={sortByStore}
            onToggleChecked={toggleChecked}
            onClearChecks={clearChecks}
          />
        );
      case 'store-settings':
        return (
          <StoreLayoutList
            storeLayouts={storeLayouts}
            allCategories={allCategories}
            customCategories={customCategories}
            onAdd={addStoreLayout}
            onUpdate={updateStoreLayout}
            onDelete={deleteStoreLayout}
            onAddCustomCategory={addCustomCategory}
            onDeleteCustomCategory={deleteCustomCategory}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div className="app">
        <Header title={getPageTitle(activeTab)} />
        <div className="app__content">
          <Page>
            {renderPage()}
          </Page>
        </div>
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </ErrorBoundary>
  );
}

export default App;
