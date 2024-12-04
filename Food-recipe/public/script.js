import foods from './recipeData.js';
const db = firebase.firestore();

const recipeBtn = document.getElementById("recipeBtn");
const slotBtn = document.getElementById("slotBtn");
const recipeModal = document.getElementById("recipeModal");
const slotModal = document.getElementById("slotModal");
const closeBtn = document.getElementsByClassName("close");
const foodName = document.getElementById("foodName");
const recipe = document.getElementById("recipe");
const foodImages = document.getElementById("foodImages");
const modalSearchBtn = document.getElementById("modalSearchBtn");
const searchInput = document.getElementById('searchInput');
const errorMessage = document.getElementById('errorMessage');
const backButton = document.getElementById('backButton');

db.collection('foods').get().then((snapshot) => {
    snapshot.forEach(doc => {
      const foodData = doc.data();
      foods.push({
        name : foodData.name,
        category : foodData.category,
        image : foodData.image,
        recipe : {
            ingredients : foodData.ingredients,
            sauceIngredients : foodData.sauceIngredients,
            preparation : foodData.preparation,
            cooking : foodData.cooking,
        }
      });
    });
    console.log(foods)
})

// 카테고리 버튼 생성 및 이벤트 처리
function createCategoryButtons() {
    const categories = ['한식', '자취요리'];
    const categoryContainer = document.createElement('div');
    categoryContainer.className = 'category-container';
    
    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category;
        button.className = 'category-btn';
        button.addEventListener('click', () => filterByCategory(category));
        categoryContainer.appendChild(button);
    });

    // 검색 컨테이너 다음에 카테고리 버튼들을 삽입
    const searchContainer = document.querySelector('.search-container');
    searchContainer.parentNode.insertBefore(categoryContainer, searchContainer.nextSibling);
}

// 카테고리별 필터링 함수
function filterByCategory(category) {
    // 모든 카테고리 버튼의 스타일 초기화
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(btn => btn.classList.remove('active'));
    
    // 선택된 카테고리 버튼 스타일 적용
    event.target.classList.add('active');
    
    // 이미지 컨테이너 비우기
    foodImages.innerHTML = '';
    
    // 선택된 카테고리의 음식들만 필터링하여 표시
    const filteredFoods = foods.filter(food => food.category === category);
    
    filteredFoods.forEach(food => {
        const img = document.createElement('img');
        img.src = food.image;
        img.alt = food.name;
        
        img.addEventListener('click', () => {
            document.querySelector('#result').style.display = 'block'
            displayFood(food);
            closeModal(recipeModal);
        });
        
        foodImages.appendChild(img);
    });
}

function openModal(modal) {
    modal.style.display = 'block';
    if (modal === recipeModal && !document.querySelector('.category-container')) {
        createCategoryButtons();
    }
}

// 나머지 기존 코드는 동일하게 유지
function closeModal(modal) {
    modal.style.display = 'none';
}

recipeBtn.addEventListener('click', () => openModal(recipeModal));
slotBtn.addEventListener('click', () => openModal(slotModal));

searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchFood();
    }
});

Array.from(closeBtn).forEach(btn => {
    btn.addEventListener('click', () => {
        closeModal(recipeModal);
        closeModal(slotModal);
    });
});

function searchFood() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const foundFood = foods.find(food => food.name.toLowerCase() === searchTerm);

    if (foundFood) {
        displayFood(foundFood);
        closeModal(recipeModal);
    } else {
        errorMessage.textContent = '음식을 찾을 수 없습니다.';
    }
}

modalSearchBtn.addEventListener('click', searchFood);

function displayFood(food) {
    foodName.textContent = food.name;
    backButton.style.display = 'block';
    
    // 레시피 표시 HTML 구성
    const recipeHTML = `
        <div class="recipe-section">
            <h3>🥘 재료</h3>
            <ul class="ingredients-list">
                ${food.recipe.ingredients ? 
                    food.recipe.ingredients.map(item => `<li>${item}</li>`).join('') :
                    '<li>등록된 재료가 없습니다.</li>'}
            </ul>

            <h3>🍶 양념장</h3>
            <ul class="sauce-list">
                ${food.recipe.sauceIngredients ?
                    food.recipe.sauceIngredients.map(item => `<li>${item}</li>`).join('') :
                    '<li>등록된 양념장이 없습니다.</li>'}
            </ul>
            
            <h3>🔪 준비하기</h3>
            <ul>
                ${food.recipe.preparation ?
                    food.recipe.preparation.map(step => `<li>${step}</li>`).join('') :
                    '<li>등록된 준비 과정이 없습니다.</li>'}
            </ul>
            
            <h3>👩‍🍳 조리하기</h3>
            <ul>
                ${food.recipe.cooking ?
                    food.recipe.cooking.map((step, index) => `<li>${index + 1}. ${step}</li>`).join('') :
                    '<li>등록된 조리 과정이 없습니다.</li>'}
            </ul>
        </div>
    `;
    
    recipe.innerHTML = recipeHTML;
}


backButton.addEventListener('click', () => {
    // 레시피 내용 초기화
    foodName.textContent = '';
    recipe.innerHTML = '';
    backButton.style.display = 'none'; // 뒤로가기 버튼 숨기기
    document.querySelector('#result').style.display = 'none'
});

// 초기 상태에서는 뒤로가기 버튼 숨기기
backButton.style.display = 'none';


searchInput.addEventListener('input', showSearchSuggestions);

function showSearchSuggestions() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const suggestions = foods.filter(food => food.name.toLowerCase().includes(searchTerm));

    foodImages.innerHTML = '';  // 기존 결과 지우기
    suggestions.forEach(food => {
        const img = document.createElement('img');
        img.src = food.image;
        img.alt = food.name;
        
        img.addEventListener('click', () => {
            displayFood(food);
            closeModal(recipeModal);
        });

        foodImages.appendChild(img);
    });

    if (suggestions.length === 0) {
        errorMessage.textContent = '음식을 찾을 수 없습니다.';
    } else {
        errorMessage.textContent = '';
    }
}

function spinSlots() {
    const slotElements = [slot1, slot2, slot3];
    const foodItems = foods.map(food => ({ name: food.name, image: food.image }));
    const totalItems = foodItems.length;

    slotElements.forEach(slot => {
        // 슬롯 안에 이미지를 유지하고 소스만 변경
        if (!slot.querySelector("img")) {
            const img = document.createElement("img");
            img.className = "slot-image";
            slot.appendChild(img);
        }
    });

    let spins = 0;
    const maxSpins = 15; // 회전 횟수

    const spinInterval = setInterval(() => {
        slotElements.forEach(slot => {
            const img = slot.querySelector("img");
            const randomIndex = Math.floor(Math.random() * totalItems);
            const food = foodItems[randomIndex];
            img.src = food.image;
            img.alt = food.name;
            slot.dataset.foodName = food.name; // 음식 이름 저장
        });

        spins++;
        if (spins >= maxSpins) {
            clearInterval(spinInterval); // 회전 종료
            slotElements.forEach(slot => slot.classList.add('selectable')); // 선택 가능 표시
        }
    }, 100); // 회전 간격
}

function enableSlotSelection() {
    const slotElements = [slot1, slot2, slot3];
    slotElements.forEach(slot => {
        slot.addEventListener("click", () => {
            if (slot.classList.contains("selectable")) {
                const selectedFoodName = slot.dataset.foodName; // 데이터 속성에서 음식 이름 가져옴
                const selectedFood = foods.find(food => food.name === selectedFoodName);
                if (selectedFood) {
                    displayFood(selectedFood); // 레시피 표시
                    closeModal(slotModal); // 모달 닫기
                }
            }
        });
    });
}

function createDarkModeToggle() {
    const darkModeToggle = document.createElement('button');
    darkModeToggle.id = 'darkModeToggle';
    darkModeToggle.innerHTML = '🌓';
    darkModeToggle.style.position = 'absolute';
    darkModeToggle.style.top = '10px';
    darkModeToggle.style.left = '10px';
    darkModeToggle.style.backgroundColor = 'transparent';
    darkModeToggle.style.border = 'none';
    darkModeToggle.style.fontSize = '24px';
    
    darkModeToggle.addEventListener('click', toggleDarkMode);
    
    document.querySelector('.container').appendChild(darkModeToggle);
}

// 다크 모드 토글 함수
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    
    // 사용자 선택 모드 로컬 스토리지에 저장
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

function createOffCanvasButton() {
    const offCanvasButton = document.createElement('button');
    offCanvasButton.id = 'offCanvasButton';
    offCanvasButton.innerHTML = '☰'; // 햄버거 메뉴 스타일
    offCanvasButton.style.position = 'absolute';
    offCanvasButton.style.top = '10px';
    offCanvasButton.style.right = '10px'; // 기존 다크모드 위치
    offCanvasButton.style.backgroundColor = 'transparent';
    offCanvasButton.style.border = 'none';
    offCanvasButton.style.fontSize = '24px';
    
    offCanvasButton.addEventListener('click', toggleOffCanvas);
    document.querySelector('.container').appendChild(offCanvasButton);
}

function toggleOffCanvas() {
    const offcanvas = document.getElementById('offcanvasTop');
    const backdrop = document.getElementById('offcanvasBackdrop');
    const isOpen = offcanvas.classList.contains('open');

    if (isOpen) {
        offcanvas.classList.remove('open');
        document.body.classList.remove('offcanvas-open');
        backdrop.classList.remove('show');
    } else {
        offcanvas.classList.add('open');
        document.body.classList.add('offcanvas-open');
        setTimeout(function(){
            backdrop.classList.add('show');
        }, 300)
    }

    document.getElementById('offcanvas-close').addEventListener('click', () => {
        offcanvas.classList.remove('open');
        setTimeout(function(){
            backdrop.classList.remove('show');
        }, 100)
    });
}

// 화면 바깥 클릭으로 오프캔버스 닫기
document.addEventListener('click', (event) => {
    const offcanvas = document.getElementById('offcanvasTop');
    const backdrop = document.getElementById('offcanvasBackdrop');
    const offCanvasButton = document.getElementById('offCanvasButton');

    if (
        offcanvas.classList.contains('open') &&
        !offcanvas.contains(event.target) &&
        event.target !== offCanvasButton
    ) {
        offcanvas.classList.remove('open');
        backdrop.classList.remove('show');
        document.body.classList.remove('offcanvas-open');
    }
});

document.addEventListener('click', (event) => {
    if (document.body.classList.contains('offcanvas-open')) {
        const blockedElements = document.querySelectorAll('#darkModeToggle, .commonBtn');
        blockedElements.forEach((el) => {
            if (el.contains(event.target)) {
                event.stopPropagation();
                event.preventDefault();
            }
        });
    }
});

function initializeUI() {
    createDarkModeToggle();
    createOffCanvasButton();
}

initializeUI();


document.addEventListener('DOMContentLoaded', () => {    
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
        document.body.classList.add('dark-mode');
    }
});

// 페이지 로드 시 초기 모드 설정
document.addEventListener('DOMContentLoaded', () => {
    createDarkModeToggle();
    
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
        document.body.classList.add('dark-mode');
    }
});

if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }

spinButton.addEventListener("click", spinSlots);
enableSlotSelection();

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.koreafood-container');

    // foods 배열의 각 항목을 순회하며 HTML 구조를 생성
    foods.forEach(food => {
        const card = document.createElement('div');
        card.classList.add('card');

        // 카드의 이미지, 제목 및 기타 정보를 삽입
        card.innerHTML = `
            <img src="${food.image}" alt="${food.name}" class="card-image">
            <div class="card-content">
                <h3 class="card-title">${food.name}</h3>
                <div class="user-info">
                    <div class="user-avatar"></div>
                    <span class="user-name">${food.category}</span>
                </div>
                <p>${food.recipe.ingredients.join(', ')}</p>
            </div>
        `;

        container.appendChild(card);
    });
});