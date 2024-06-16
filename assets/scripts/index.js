
/** Дожидаемся загрузки страницы, перед тем как что-то делать */
const onLoadHandler = () => {

	// const allthing = document.getElementById('allthing-e9910041222f');

	const tabsDesc =
	{
		new:
		{
			label_id: "control-new",
			label: document.getElementById('control-new'),
		},
		view:
		{
			label_id: "control-view",
			label: document.getElementById('control-view'),
		},
	};

	// Вешаем на ярлыки вкладок обработчики клика
	{
		const tabs = document.querySelectorAll('.main-content .feedback-tab');

		const switchTabHandler = (evt, tabName) => {
			evt.preventDefault();

			// Подчёркиваем ярлык выбранной вкладки, убираем подчёркивание с остальных
			Object.values(tabsDesc).forEach(desc => {
				if (desc.label === evt.target)
					desc.label.classList.add('selected-label');
				else
					desc.label.classList.remove('selected-label');
			});

			// Показваем выбранную вкладку, скрываем остальные
			tabs.forEach(tab => {
				if (tab.dataset?.tabname !== tabName)
					tab.classList.add('feedback-hidden');
				else
					tab.classList.remove('feedback-hidden');
			});
		};

		Object.entries(tabsDesc).forEach(([tabName, tabDesc]) =>
			tabDesc.label.addEventListener('click', evt => switchTabHandler(evt, tabName)));
	}

	// Обрабатываем добавление и удаления
	{
		const productsListElement = document.getElementById('products-list');

		// На старте собираем информацию об отзывах в localStorage
		const feedbacks = Object.keys(localStorage).filter(key => key.startsWith('fb-'))
			.map(key => JSON.parse(localStorage[key]));

		const productsSet = new Set(feedbacks.map(feedback => feedback.name));

		const leaveFeedbackSubmitHandler = evt => {
			evt.preventDefault();

			// Генерируем id, пока не найдём уникальный
			let recordID = '';
			do {
				recordID = 'fb-' + Math.floor(Math.random() * 10 ** 8);
			} while (localStorage['fb-' + recordID]);

			const form = evt.target;
			const productName = form['product-name']?.value || 'Продукт без названия';

			const record =
			{
				id: recordID,
				name: productName,
				feedback: form['feedback-text']?.value || 'Отзыв отсутствует',
			};

			localStorage[recordID] = JSON.stringify(record);

			/* И в элемент, если нет */
			if (!productsSet.has(productName)) {
				productsSet.add(productName);
				productsListElement.innerHTML +=
					`<div data-name='${productName}'>${productName}</div>`;
			}

			form['product-name'].value = '';
			form['feedback-text'].value = '';
		};

		const leaveFeedbackFormElement = document.getElementById('leave-feedback-form');
		leaveFeedbackFormElement.addEventListener('submit', leaveFeedbackSubmitHandler);

		productsListElement.innerHTML = Array.from(productsSet).map(product =>
			`<div data-name='${product}'>${product}</div>`).join('');

		const feedbacksListElement = document.getElementById('fb-list');

		const removeFeedbackHandler = evt => {
			const button = evt.target;
			const recordID = button?.dataset?.recordid;

			// Если нет, значит это не кнопка
			if (!recordID) return;

			const element = button?.closest('.record');
			element.remove();

			const name = JSON.parse(localStorage[recordID] || '{}')?.name || '';
			localStorage.removeItem(recordID);

			// Остались ли записи о таком продукте?
			const atLeastOne = Object.keys(localStorage).filter(key => key.startsWith('fb-'))
				.filter(key => JSON.parse(localStorage[key] || {})?.name === name);

			// Если нет, удаляем и из списка со страницы
			if (!atLeastOne.length) {
				productsSet.delete(name);
				productsListElement.querySelector(`div [data-name='${name}']`)?.remove();
			}
		};

		feedbacksListElement.addEventListener('pointerdown', removeFeedbackHandler);

		const selectionProductHandler = evt => {
			evt.preventDefault();

			const name = evt.target?.dataset?.name;

			if (!name) return;

			const feedbacksByName = Object.keys(localStorage).filter(key => key.startsWith('fb-'))
				.filter(key => JSON.parse(localStorage[key]).name === name)
				.map(key => JSON.parse(localStorage[key]));

			feedbacksListElement.innerHTML = feedbacksByName.map(product =>
				`
					<div class='framed record'>
						<div class='framed'>
							${product.name}
						</div>

						<div class='framed'>
							${product.feedback}
						</div>

						<button type='button' data-recordid='${product.id}' class='feedback-button'>
							Удалить
						</button>
					</div>
				`
			).join('');
		};

		productsListElement.addEventListener('pointerdown', selectionProductHandler);

	}
};

// Дожидаемся загрузки страницы, перед тем как что-то делать
window.addEventListener('load', onLoadHandler);
