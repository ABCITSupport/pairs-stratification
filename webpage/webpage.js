/*************************************************************************/
// Function to build a rankings table
function buildRankingTable(extraHeader, rankingsTable) {
	// Create table
	const table = document.createElement('table');
	table.border = '1';
	table.style.borderCollapse = 'collapse';
	table.style.width = '100%'
	table.className = 'rankingstable'

	// Build the table header, starting with the direction for 2 winner events
	if (extraHeader != null) {
		const thead = document.createElement('thead');
		const headerRow = document.createElement('tr');
		const th = document.createElement('th');
		th.textContent = extraHeader;
		th.setAttribute("colspan", "10");
		headerRow.appendChild(th);
		thead.appendChild(headerRow);
		table.appendChild(thead);
	}

	// Followed by the two header rows
	{
		const thead = document.createElement('thead');
		const headerRow = document.createElement('tr');
		['', '', '', '', '', 'Master', 'Small', 'Grand'].forEach(headerText => {
			const th = document.createElement('th');
			th.textContent = headerText;
			headerRow.appendChild(th);
		});
		thead.appendChild(headerRow);
		table.appendChild(thead);
	}
	{
		const thead = document.createElement('thead');
		const headerRow = document.createElement('tr');
		if (eventInfo.scoremethod != 1) {
			['Pos', 'Pair#', 'Strat', 'Pair', 'Score', 'Points', 'Slams', 'Slams'].forEach(headerText => {
				const th = document.createElement('th');
				th.textContent = headerText;
				headerRow.appendChild(th);
			});
		}
		else {
			['Pos', 'Pair#', 'Strat', 'Pair', 'IMPs', 'Points', 'Slams', 'Slams'].forEach(headerText => {
				const th = document.createElement('th');
				th.textContent = headerText;
				headerRow.appendChild(th);
			});
		}
		thead.appendChild(headerRow);
		table.appendChild(thead);
	}

	// Create the table body
	const tbody = document.createElement('tbody');
	rowNum = 0;							// Used to stripe the table
	rankingsTable.forEach(item => {
		const row = document.createElement('tr');
		// Add the position and pair number
		[item.pos, item.pairnum, item.strat].forEach(cellText => {
			const td = document.createElement('td');
			td.textContent = cellText;
			td.className = 'itemc';
			row.appendChild(td);
		});
		// Add the pair names as a link to generate the personal score cards
		{
			const td = document.createElement('td');
			const link = document.createElement('a');
			link.href = '#';
			link.textContent = item.pair;
			link.addEventListener('click', function(event) {
				event.preventDefault();
				nameClick(item.pairnum);
			});
			td.appendChild(link);
			td.className = 'item';
			row.appendChild(td);
		}
		// Add the scores
		{
			const td = document.createElement('td');
			if (eventInfo.scoremethod == 0) {
				td.textContent = item.score + '/' + item.max + ' = ' + item.percent + '%';
			}
			else {
				td.textContent = item.score;
			}
			td.className = 'itemc';
			row.appendChild(td);
		}
		// Add matchpoints
		{
			const td = document.createElement('td');
			td.textContent = item.mps;
			td.className = 'itemc';
			row.appendChild(td);
		}
		// Add the number of slams, leaving the cell empty if none
		{
			const td = document.createElement('td');
			if (item.ss != 0) {
				td.textContent = item.ss;
			}
			td.className = 'itemc';
			row.appendChild(td);
		}
		{
			const td = document.createElement('td');
			if (item.gs != 0) {
				td.textContent = item.gs;
			}
			td.className = 'itemc';
			row.appendChild(td);
		}
		// Stripe the table on even rows using a class on the row element
		rowNum++;
		if (rowNum % 2 === 0) {
			row.className = 'even';
		}
		// Glue the newly created row into the table body
		tbody.appendChild(row);
	});
	// Results table built. Append the body onto the table element
	table.appendChild(tbody);
	// And wrap the whole thing in a div, returning that
	const div = document.createElement('div');
	div.setAttribute("class", "rtablediv");
	div.append(table);
	return div;
}

/*************************************************************************/
// Function to build a scorecard table
function buildScorecardTable(pairnum) {
	istwowinner = eventInfo.istwowinner;
	boardsperround = eventInfo.boardsperround;

	// Create table
	const table = document.createElement('table');
	table.className = 'scorecardtable'

	// Build the table header, starting with the pair name
	pairname = getPairName(pairnum);
	{
		const thead = document.createElement('thead');
		const headerRow = document.createElement('tr');
		const th = document.createElement('th');
		colspan = istwowinner ? 11 : 12;
		th.setAttribute("colspan", eventInfo.scoremethod == 0 ? String(colspan) : (eventInfo.scoremethod == 1 ? String(colspan - 1) : String(colspan - 2)));
		if (pairname != null) {
			th.textContent = 'Pair ' + pairnum + ' - ' + pairname;
		}
		headerRow.appendChild(th);
		thead.appendChild(headerRow);
		table.appendChild(thead);
	}

	// Followed by the header row
	{
		const thead = document.createElement('thead');
		const headerRow = document.createElement('tr');
		{
			const th = document.createElement('th');
			th.textContent = 'Bd';
			headerRow.appendChild(th);
		}
		if (!istwowinner) {
			const th = document.createElement('th');
			th.textContent = 'Dir';
			headerRow.appendChild(th);
		}
		{
			const th = document.createElement('th');
			th.textContent = 'Opps';
			th.colSpan = 2;
			headerRow.appendChild(th);

		}
		['Ctrt', 'By', 'Lead', 'Tks', '+', '-'].forEach(headerText => {
			const th = document.createElement('th');
			th.textContent = headerText;
			headerRow.appendChild(th);
		});
		if (eventInfo.scoremethod == 0) {
			['Pts', '%'].forEach(headerText => {
				const th = document.createElement('th');
				th.textContent = headerText;
				headerRow.appendChild(th);
			});
		}
		else if (eventInfo.scoremethod == 1) {
			const th = document.createElement('th');
			th.textContent = 'IMPs';
			headerRow.appendChild(th);
		}
		thead.appendChild(headerRow);
		table.appendChild(thead);
	}

	// Create the table body
	const tbody = document.createElement('tbody');
	rowNum = 0;							// Used to stripe the table
	scorecard = null;
	scorecards.forEach(item => {
		if (item.pairnum == pairnum) {
			scorecard = item;
		}
	});
	// Function to create and return a link for the personal scorecard
	function createLink(linkText, boardNum, pairnum) {
		const link = document.createElement('a');
		link.href = '#';
		link.textContent = linkText;
		if (linkText == '') {
			link.className = 'blanklink';
		}
		else {
			link.className = 'table-cell-link';
		}
		link.addEventListener('click', function(event) {
			event.preventDefault();
			boardClick(boardNum, pairnum);
		});
		return link;
	}
	scorecard.board.forEach(item => {
		// Create a link to the board
		const row = document.createElement('tr');
		const link = document.createElement('a');
		link.href = '#';
		link.className = 'table-cell-link';
		link.addEventListener('click', function(event) {
			event.preventDefault();
			boardClick(item.boardNum, pairnum);
		});
		// Add the board number
		{
			const td = document.createElement('td');
			td.className = 'itemc';
			td.appendChild(createLink(item.boardNum, item.boardNum, pairnum));
			row.appendChild(td);
		}
		if (!istwowinner) {
			const td = document.createElement('td');
			td.className = 'itemc';
			td.appendChild(createLink(item.isNS ? "N/S" : "E/W", item.boardNum, pairnum));
			row.appendChild(td);
		}
		// Add the opps info only at the start of each round
		if (rowNum % boardsperround === 0) {
			const td = document.createElement('td');
			td.className = 'itemc';
			td.appendChild(createLink(item.versus, item.boardNum, pairnum));
			td.rowSpan = boardsperround;
			row.appendChild(td);
			pairname = getPairName(item.versus);
			{
				const td = document.createElement('td');
				const innerdiv = document.createElement('div')
				innerdiv.className = 'player-names';
				innerdiv.appendChild(createLink((pairname != null) ? pairname : '', item.boardNum, pairnum));
				td.append(innerdiv);
				td.rowSpan = boardsperround;
				td.className = 'item';
				row.appendChild(td);
			}
		}
		[item.contract, item.by, item.lead, item.tricks, item.plus, item.minus].forEach(scoreitem => {
			const td = document.createElement('td');
			td.className = 'itemc';
			td.appendChild(createLink(scoreitem, item.boardNum, pairnum));
			row.appendChild(td);
		});
		points = item.pts;
		if (eventInfo.scoremethod == 1) {
			points = (points >= 0 ? '+' : '') + points.toFixed(2);
		}
		if (eventInfo.scoremethod == 0) {
			const td = document.createElement('td');
			td.className = 'itemc';
			td.appendChild(createLink(points, item.boardNum, pairnum));
			row.appendChild(td);
			{
				const td = document.createElement('td');
					if (item.percent < 20) {
						td.className = 'colorlolo';
					}
					else if (item.percent < 40) {
						td.className = 'colorlo';
					}
					else if (item.percent <= 60) {
						td.className = 'colormed';
					}
					else if (item.percent < 80) {
						td.className = 'colorhi';
					}
					else {
						td.className = 'colorhihi'
					}
				td.appendChild(createLink(item.percent, item.boardNum, pairnum));
				row.appendChild(td);
			}
		}
		else if (eventInfo.scoremethod == 1) {
			const td = document.createElement('td');
			if (item.pts <= -5) {
				td.className = 'colorlolo';
			}
			else if (item.pts < 0) {
				td.className = 'colorlo';
			}
			else if (item.pts <= 2) {
				td.className = 'colormed';
			}
			else if (item.pts < 5) {
				td.className = 'colorhi';
			}
			else {
				td.className = 'colorhihi'
			}
			td.appendChild(createLink(points, item.boardNum, pairnum));
			row.appendChild(td);
		}

		// Stripe the table on even rows using a class on the row element
		rowNum++;
		if (rowNum % 2 === 0) {
			row.className = 'even';
		}
		// Glue the newly created row into the table body
		tbody.appendChild(row);
	});
	// Scorecard table built. Append the body onto the table element
	table.appendChild(tbody);
	// And wrap the whole thing in a div, returning that
	const div = document.createElement('div');
	div.setAttribute("class", "stablediv");
	div.appendChild(table);
	return div;
}

/*************************************************************************/
// Function to build a hand content
function buildHand(handDeal, className) {
	const td = document.createElement('td');
	td.className = className;
	// Use unicode chars for the suit symbols
	td.innerHTML = '<span class="ssym">&#x2660;&nbsp;</span>' + handDeal[0] +
					 '<br><span class="ssym" style="color:red">&#x2665;&nbsp;</span>' + handDeal[1] +
					 '<br><span class="ssym" style="color:red">&#x2666;&nbsp;</span>' + handDeal[2] +
					 '<br><span class="ssym">&#x2663;&nbsp;</span>' + handDeal[3];
	return td;
}

/*************************************************************************/
// Function to build a double-dummy result row content
function buildDDRow(directionName, ddRowData, className) {
	const ddRow = document.createElement('tr');
	ddRow.className = className;
	{
		const td = document.createElement('td');
		td.textContent = directionName;
		ddRow.appendChild(td);
	}
	{
		const td = document.createElement('td');
		var tricks = ddRowData[0] - 6;
		td.textContent = tricks <= 0 ? '-' : tricks;
		ddRow.appendChild(td);
	}
	{
		const td = document.createElement('td');
		var tricks = ddRowData[1] - 6;
		td.textContent = tricks <= 0 ? '-' : tricks;
		ddRow.appendChild(td);
	}
	{
		const td = document.createElement('td');
		var tricks = ddRowData[2] - 6;
		td.textContent = tricks <= 0 ? '-' : tricks;
		ddRow.appendChild(td);
	}
	{
		const td = document.createElement('td');
		var tricks = ddRowData[3] - 6;
		td.textContent = tricks <= 0 ? '-' : tricks;
		ddRow.appendChild(td);
	}
	{
		const td = document.createElement('td');
		var tricks = ddRowData[4] - 6;
		td.textContent = tricks <= 0 ? '-' : tricks;
		ddRow.appendChild(td);
	}
	return ddRow;
}

/*************************************************************************/
// Function to build a deal table
function buildDeal(boardNum) {
	if (typeof deals !== "undefined") {
		// Find the deal data for the given board number
		boardData = deals[boardNum];
		deal = boardData.deal;
		tricks = boardData.tricks;
	}

	// Create table
	const table = document.createElement('table');
	table.className = 'dealtable'

	// Build table header, starting with the board details
	{
		const thead = document.createElement('thead');
		const headerRow = document.createElement('tr');
		const th = document.createElement('th');
		th.setAttribute("colspan", '4');
		th.textContent = 'Board ' + boardNum;
		headerRow.appendChild(th);
		thead.appendChild(headerRow);
		table.appendChild(thead);
	}
	if (typeof deals !== "undefined") {
		// The table body is 3x3 cells
		const tbody = document.createElement('tbody');
		// Top row has board info, then North, then a blank cell
		{
			const row = document.createElement('tr');
			{
				const td = document.createElement('td');
				td.innerHTML = 'Dealer: ' + boardData.dealer + '<br>Vul: ' + boardData.vulnerability;
				td.className = 'dealinfo';
				row.appendChild(td);
			}
			row.append(buildHand(deal[0], 'northhand'));
			{
				const td = document.createElement('td');
				row.appendChild(td);
			}
			tbody.appendChild(row);
		}
		// Middle row has West, then board, then East
		{
			const row = document.createElement('tr');
			row.append(buildHand(deal[3], 'westhand'));
			{
				const td = document.createElement('td');
				td.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAIAAADeJhTwAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjFEOTQ4NTEzQjI4NDExRjE5NjhEOURDMDBDQUIxNjczIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjFEOTQ4NTE0QjI4NDExRjE5NjhEOURDMDBDQUIxNjczIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MUQ5NDg1MTFCMjg0MTFGMTk2OEQ5REMwMENBQjE2NzMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MUQ5NDg1MTJCMjg0MTFGMTk2OEQ5REMwMENBQjE2NzMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz62igMAAAAE/ElEQVR42uycPUxTURTH0TjxHC0zuvmqm1W3EtlI1AWiLjKoQxODDk2MmkgYiCFxUAe7yCALmrKISZ00sPm1IbhJGaWTia+zRw8eb/tqFfKk77a/fzrcchso5/fOx33tOXu+fP3Sh9KhvZgAGAgYwEDAAAYCBjAQMICBgNFb2ufRe114ulCeL+s6M5CZuT8TBEHTa6ZuT619XJNFeCScnJ7EM3ZDtc2asCFMpUWVxYo6ATBSoUcPHkVRBIy0BKvSwxIwOqyRMyO6eP/mvTyA0UmNnh8dPDioa3GO7ghWvsKQorZwraBrIdEdwcrjnCGeMXZhzILV0qslYKQlWM3Nzkk+B0YnVbxV1HO4BCupdIHRSWUGMuIfupYzoNfHwG64UShlbu5kjgSeFhUmCvGbhsDoXKU7UQBGWiSRamh4yOt/YY9H37WVytWK1/BIGH+BFFQb6xu67g/6reoFBurhMAUMBAxgIGAAAwEDGAgYCBjAQMAABgIGMBAwgIGAAQwEDGAgYCBgAAMBAxgIGF2hfZggWbVvnWr5fW0TX3xOWOfOnmuz++z5s517xtTtKV0E+4PizWLT7r2796JvUcvd6nr1yeMnus6fyvveOZGKMCVWtmEQtc1aZiBjW/LUnRMh1nf7IdZWfvc6jl8e70HLyvUnV2GSMI4dP2YWl4VN7NCnDbFyZa0BxuoWiSAIvGtaSURy4bbPENuuprJHs3H7bsF42wijafcXqu7oQ01FaSt47bqWa99+HkVRU9ngOoq7dTh7GCsnVtqGR0PJBwrAEoOBkShkE22EgTqmC6NnPWN1ZTVe17YPXH+HIVmoslhpSgwf3n3Y2h3Oi09o36MELv1j9j7kaRe0Z+/4wNEUPMYujLWH8fcTuFjfDGqJwYJSmA0tr5i72JvInSBhJH0Cl1CjA4SUgQQrC00ahXRXf27Nvxrietay4gc21CSZBB5PwnLVL79edkm4Fhda5hZu8keJwXCT8I9Q+CscSYzSHG6h8NPqJ0sYblmMEoPhmlsikhZXLiTLDULCPEMOjNg3+Zyh5lYr28AIiUJ2d8QilTsLrZcTRsvSVktT95bSDmHELevGLskN8jcaSPRwUfun0lbN0gbGv364pOZu+L3Z8E83Tihq/2+YUlew01/8aC0Zwp2f2bMH7/afWCQGQ+KdRZ4DmQPxOGaDTTWjcKVvV3zS51tpi4ABDAQMBAxgIGAAAwEDGAgYwEDAAAYCBjAQMBAwgIGAAQwEDGAgYAADAQMYCBjAQJ1UNwz/chuE3OY2YOwqg8qLStNwn76f7aB3pu/42PXsK4ylV0ulh6WWW1EU1aM6nrFLqm3WjIT4wej50dzJnESn6nr15YuXbjebX/Kyc2nh6UJ5vqzr8Uvj7kiyvp9TMwSMj7223ifweLr2d0aGl6Wt294pXuL2n3stXxssr165agwkIuWH8yOnR3xvsfUVhiSG0oOSTTFRDQ0PXbx00d/JDB63HksJK7VTZbFiw6/US4q3itsdmwmM/4hk5v6Mj2m8S5ryhcTc7JydMMQzJqcnqaY6I4lOhYmCJfD20+GBkfAJvGU56/tQJS9hLL9evnH9hpww3DwhacOKK0/Pfb6ewAVDeb4sD7F7f9C/sb7hgvF0FL6XMNwTeNNRQ9gICUrb3ZZk6ernar1eN0KDhwa9Ht7KvCkSOAIGMBAwgIGAAQyUtL4LMABLyAiB0POTnAAAAABJRU5ErkJggg==" alt="Table center">';
				td.className = 'dealcenter';
				row.appendChild(td);
			}
			row.append(buildHand(deal[1], 'easthand'));
			tbody.appendChild(row);
		}
		// Bottom row has double-dummy contracts, then South, then blank
		{
			const row = document.createElement('tr');
			{
				// The double-dummy contracts is a nested table
				const ddtable = document.createElement('table');
				ddtable.className = 'ddtable'
				const thead = document.createElement('thead');
				const headerRow = document.createElement('tr');
				{
					const th = document.createElement('th');
					headerRow.appendChild(th);
				}
				{
					const th = document.createElement('th');
					th.textContent = 'N';
					headerRow.appendChild(th);
				}
				{
					const th = document.createElement('th');
					th.textContent = 'S';
					headerRow.appendChild(th);
				}
				{
					const th = document.createElement('th');
					th.textContent = 'H';
					headerRow.appendChild(th);
				}
				{
					const th = document.createElement('th');
					th.textContent = 'D';
					headerRow.appendChild(th);
				}
				{
					const th = document.createElement('th');
					th.textContent = 'C';
					headerRow.appendChild(th);
				}
				thead.appendChild(headerRow);
				ddtable.appendChild(thead);
				const ddtbody = document.createElement('tbody');
				ddtbody.appendChild(buildDDRow('N', tricks[0], 'ddrow'));
				ddtbody.appendChild(buildDDRow('S', tricks[1], 'ddrow'));
				ddtbody.appendChild(buildDDRow('E', tricks[2], 'ddrow'));
				ddtbody.appendChild(buildDDRow('W', tricks[3], 'ddrow'));
				ddtable.appendChild(ddtbody);
				row.appendChild(ddtable);
			}
			row.append(buildHand(deal[2], 'southhand'));
			tbody.appendChild(row);
			{
				const td = document.createElement('td');
				row.appendChild(td);
			}
			tbody.appendChild(row);
		}
		table.appendChild(tbody);
	}
	return table;
}

/*************************************************************************/
// Function to build a traveller table
function buildTraveller(boardNum, pairnum) {
	// Create table
	const table = document.createElement('table');
	table.className = 'travellertable'

	// Build table header
	{
		const thead = document.createElement('thead');
		const headerRow = document.createElement('tr');
		if (eventInfo.scoremethod != 2) {
			headerRow.innerHTML = '<th>NS</th><th>EW</th><th>Ctrt</th><th>By</th><th>Lead</th><th>Tks</th><th>+</th><th>-</th><th colspan="2">Score</th>';
		}
		else {
			headerRow.innerHTML = '<th>NS</th><th>EW</th><th>Ctrt</th><th>By</th><th>Lead</th><th>Tks</th><th>+</th><th>-</th>';
		}
		thead.appendChild(headerRow);
		table.appendChild(thead);
	}
	// Add the table rows
	const tbody = document.createElement('tbody');
	var rowNum = 1;
	travellers[boardNum].forEach(travellerLine => {
		const row = document.createElement('tr');
		[travellerLine.ns, travellerLine.ew, travellerLine.contract, travellerLine.by, travellerLine.lead, travellerLine.tricks].forEach(lineitem => {			const td = document.createElement('td');
			td.textContent = lineitem;
			row.appendChild(td);
		});
		[travellerLine.plus, travellerLine.minus].forEach(lineitem => {
			const td = document.createElement('td');
			td.textContent = lineitem;
			td.className = 'scorecell'
			row.appendChild(td);
		});
		if (eventInfo.scoremethod == 0) {
			[travellerLine.nsmps, travellerLine.ewmps].forEach(lineitem => {
				const td = document.createElement('td');
				td.textContent = lineitem;
				row.appendChild(td);
			});
		}
		else if (eventInfo.scoremethod == 1) {
			const td = document.createElement('td');
			td.textContent = travellerLine.nsmps;
			td.setAttribute('colspan', '2');
			row.appendChild(td);
		}
		// Stripe the table on even rows using a class on the row element
		rowNum++;
		if (travellerLine.ns == pairnum || travellerLine.ew == pairnum) {
			// On the row for this pair, highlight it.
			row.className = 'hilite';
		}
		else {
			if (rowNum % 2 === 0) {
				row.className = 'even';
			}
		}
		tbody.appendChild(row);
	});
	table.appendChild(tbody);
	return table;
}

/*************************************************************************/
// Function to output a single rankings section
function renderOneRanking(container, rankingDataNS, rankingDataEW) {
	// Set the page type title
	const typeHeading = document.createElement('h2');
	typeHeading.id = 'contenthead';
	typeHeading.textContent = rankingDataNS.heading;
	container.appendChild(typeHeading);

	// Render the N/S results. 'extraHeader' remains unset for a single winner event
	extraHeader = null
	if (rankingDataEW !== null) {
		extraHeader = 'North/South'
	}
	// Add table to container
	container.appendChild(buildRankingTable(extraHeader, rankingDataNS.data));

	// Render the E/W results - only for 2 winner events
	if (rankingDataEW !== null) {
		extraHeader = 'East/West'
		// Add table to container
		container.appendChild(buildRankingTable(extraHeader, rankingDataEW.data));
	}
}

/*************************************************************************/
// Function to render content from JSON
function renderContent() {
	// Clear out the container first
	const container = document.getElementById('content');
	container.innerHTML = ''; // Clear previous content

	// Set the title (appears in the browser tab)
	const title = document.getElementById('title');
	title.innerHTML = ''; // Clear previous content
	title.textContent = eventInfo.eventname;

	// Set the club name and event title for the page
	const clubHeading = document.getElementById('clubname');
	clubHeading.textContent = eventInfo.clubname;
	const eventHeading = document.getElementById('eventname');
	eventHeading.textContent = eventInfo.eventname;

	renderOneRanking(container, rankings, typeof rankingsew !== 'undefined' ? rankingsew : null);
	if (typeof rankings1 !== 'undefined') {
		renderOneRanking(container, rankings1, typeof rankingsew1 !== 'undefined' ? rankingsew1 : null);
		if (typeof rankings2 !== 'undefined') {
			renderOneRanking(container, rankings2, typeof rankingsew2 !== 'undefined' ? rankingsew2 : null);
		}
	}
}

/*************************************************************************/
function nameClick(pairnum) {
	// Clear out the container first
	const container = document.getElementById('content');
	container.innerHTML = ''; // Clear previous content

	// Set the page type title
	const typeHeading = document.createElement('h2');
	typeHeading.id = 'contenthead';
	typeHeading.textContent = 'Personal Scorecard';
	container.appendChild(typeHeading);

	// Create back link
	const backdiv = document.createElement('div');
	backdiv.className = "btnwrapper";
	const backlink = document.createElement('button');
	backlink.className = "nav-btn";
	backlink.href = '#';
	backlink.onclick = function(event) { event.preventDefault(); renderContent() };
	backlink.innerHTML = '&laquo; Back';
	backdiv.appendChild(backlink);
	container.appendChild(backdiv);

	const scorewrapper = document.createElement('div');
	scorewrapper.className = "scorewrapperdiv";

	scorewrapper.appendChild(buildScorecardTable(pairnum));

	const boarddiv = document.createElement('div');
	boarddiv.className = "boarddiv";
	boarddiv.id = "boardcontent"
	scorewrapper.appendChild(boarddiv);

	container.appendChild(scorewrapper);

	// Create second back link
	const backdiv2 = document.createElement('div');
	backdiv2.className = "btnwrapper";
	const backlink2 = document.createElement('button');
	backlink2.className = "nav-btn";
	backlink2.href = '#';
	backlink2.onclick = function(event) { event.preventDefault(); renderContent() };
	backlink2.innerHTML = '&laquo; Back';
	backdiv2.appendChild(backlink2);
	container.appendChild(backdiv2);
}

/*************************************************************************/
function boardClick(boardNum, pairnum) {
	// Clear out the container first
	const container = document.getElementById('boardcontent');
	container.innerHTML = ''; // Clear previous content

	const boarddiv = document.createElement('div');
	boarddiv.className = "oneboarddiv";
	boarddiv.appendChild(buildDeal(boardNum));

	boarddiv.appendChild(buildTraveller(boardNum, pairnum));
	container.appendChild(boarddiv);

	const btnspacediv = document.createElement('div');
	btnspacediv.className = "btnwrapper";

	const backlink = document.createElement('button');
	backlink.className = "nav-btn";
	backlink.href = '#';
	backlink.onclick = function(event) { event.preventDefault(); boardClick(boardNum - 1, pairnum) };
	backlink.innerHTML = '&laquo; Prev';
	btnspacediv.appendChild(backlink);
	if (boardNum <= 1) {
		backlink.style.visibility = 'hidden';
	}
	const fwdlink = document.createElement('button');
	fwdlink.className = "nav-btn";
	fwdlink.href = '#';
	fwdlink.onclick = function(event) { event.preventDefault(); boardClick(boardNum + 1, pairnum) };
	fwdlink.innerHTML = 'Next &raquo;';
	btnspacediv.appendChild(fwdlink);
	if (boardNum >= eventInfo.numboards) {
		fwdlink.style.visibility = 'hidden';
	}
	container.appendChild(btnspacediv);
}

/*************************************************************************/
function getPairName(pairnum) {
	var pairname;
	rankings.data.forEach(rankingRecord => {
		if (rankingRecord.pairnum == pairnum) {
			pairname = rankingRecord.pair;
		}
	});
	if (pairname == null && typeof rankingsew !== 'undefined') {
		rankingsew.data.forEach(rankingRecord => {
			if (rankingRecord.pairnum == pairnum) {
				pairname = rankingRecord.pair;
			}
		});
	}
	return pairname;
}
