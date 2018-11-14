/*
This feature ...
*/

import {h} from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate';

const getFilterField = item => {
	return item
		.closest('details')
		.querySelector('summary')
		.textContent
		.trim()
		.replace(/s$/, '') // 'Assignees' -> 'Assignee'; 'Milestones -> Milestone'
		.toLowerCase();
};

const getItemName = item => {
	const itemText = select('.name', item) || select('.select-menu-item-text', item);
	const text = itemText.firstChild.textContent.trim();
	return text.includes(' ') ? `"${text}"` : text;
};

const getFilter = item => {
	const field = getFilterField(item);
	const name = getItemName(item);
	if (name) {
		return `${field}:${name}`;
	}
	// "No label/milestone/etc" filters won't have a name here and can't be excluded
};

const buildSearch = item => {
	const filter = getFilter(item);
	if (!filter) {
		return;
	}

	const search = new URLSearchParams(location.search);
	const query = (search.get('q') || '').trim();
	const negated = `-${filter}`;
	if (query.includes(negated)) {
		// If -label:bug is there, drop it (to match the regular click behavior)
		search.set('q', query.replace(negated, ' ').replace(/ {2,}/, ' ').trim());
	} else if (query.includes(filter)) {
		// If label:bug is there, replace it with -label:bug
		search.set('q', query.replace(filter, negated));
	} else {
		// If label:bug isn't there, add -label:bug
		search.set('q', `${query} ${negated}`);
	}

	return search;
};

export default function () {
	const onItemClicked = event => {
		if (!event.altKey) {
			return;
		}

		// Avoid the default (downloading the link)
		// even if the link isn't supported
		// because we never want to download pages
		event.preventDefault();
		const item = event.delegateTarget;
		const search = buildSearch(item);
		if (search) {
			item.search = search;
		}

		item.click();
	};

	delegate('.table-list-filters', 'a.select-menu-item', 'click', onItemClicked, false);
}
