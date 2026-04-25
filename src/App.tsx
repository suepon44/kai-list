import { useState } from 'react';
import { ErrorBoundary, Header, Navigation, NAV_ITEMS, Page } from './components/common';
import { RecipeList } from './components/recipe';
import { WeeklyPlanView } from './components/meal-plan';
import { ShoppingListView } from './components/shopping-list';
import { StoreLayoutList } from './components/store-layout';
import { DiaryPage } from './components/diary';
import { useRecipes } from './hooks/useRecipes';
import { useMealPlan } from './hooks/useMealPlan';
import { useShoppingList } from './hooks/useShoppingList';
import { useStoreLayout } from './hooks/useStoreLayout';
import { useDiary } from './hooks/useDiary';
import './App.css';

/** タブIDから表示タイトルを取得する */
function getPageTitle(tabId: string): string {
  if (tabId === 'recipes') return 'ひーちゃんのレシピ';
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
    extraItems,
    addExtraItem,
    removeExtraItem,
    clearExtraItems,
    extraItemsHistory,
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

  const {
    dateRecipeMap,
    recipeRanking,
    categoryBalance,
    staleRecipes,
    selectedMonth,
    goToPreviousMonth,
    goToNextMonth,
    dateRange,
    setDateRange,
  } = useDiary(savedPlans, recipes);

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
            extraItems={extraItems}
            extraItemsHistory={extraItemsHistory}
            allCategories={allCategories}
            onAssignRecipe={assignRecipe}
            onRemoveRecipe={removeRecipe}
            onSavePlan={savePlan}
            onOverwritePlan={overwritePlan}
            onLoadPlan={loadPlan}
            onDeletePlan={deletePlan}
            onResetPlan={resetPlan}
            onAddExtraItem={addExtraItem}
            onRemoveExtraItem={removeExtraItem}
            onClearExtraItems={clearExtraItems}
          />
        );
      case 'shopping-list':
        return (
          <ShoppingListView
            currentPlan={currentPlan}
            recipes={recipes}
            extraItems={extraItems}
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
      case 'diary':
        return (
          <DiaryPage
            dateRecipeMap={dateRecipeMap}
            recipeRanking={recipeRanking}
            categoryBalance={categoryBalance}
            staleRecipes={staleRecipes}
            selectedMonth={selectedMonth}
            goToPreviousMonth={goToPreviousMonth}
            goToNextMonth={goToNextMonth}
            dateRange={dateRange}
            setDateRange={setDateRange}
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
