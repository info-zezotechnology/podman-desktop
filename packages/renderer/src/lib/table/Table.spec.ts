/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import '@testing-library/jest-dom/vitest';
import { test, expect } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/svelte';

import TestTable from './TestTable.svelte';

test('Expect basic table layout', async () => {
  // render the component
  render(TestTable, {});

  // 3 people = header + 3 rows
  const rows = await screen.findAllByRole('row');
  expect(rows).toBeDefined();
  expect(rows.length).toBe(4);

  // first data row should contain John and his age
  expect(rows[1].textContent).toContain('John');
  expect(rows[1].textContent).toContain('57');

  // second data row should contain Henry and his age
  expect(rows[2].textContent).toContain('Henry');
  expect(rows[2].textContent).toContain('27');

  // last data row should contain Charlie and his age
  expect(rows[3].textContent).toContain('Charlie');
  expect(rows[3].textContent).toContain('43');
});

test('Expect column headers with sort indicators', async () => {
  render(TestTable, {});

  const headers = await screen.findAllByRole('columnheader');
  expect(headers).toBeDefined();
  expect(headers.length).toBe(5);
  expect(headers[2].textContent).toContain('Id');
  expect(headers[2].innerHTML).toContain('fa-sort');
  expect(headers[3].textContent).toContain('Name');
  expect(headers[3].innerHTML).toContain('fa-sort');
  expect(headers[4].textContent).toContain('Age');
  expect(headers[4].innerHTML).toContain('fa-sort');
});

test('Expect default sort indicator', async () => {
  render(TestTable, {});

  const headers = await screen.findAllByRole('columnheader');
  expect(headers).toBeDefined();
  expect(headers.length).toBe(5);
  expect(headers[2].textContent).toContain('Id');
  expect(headers[2].innerHTML).toContain('fa-sort-up');
});

test('Expect no default sort indicator on other columns', async () => {
  render(TestTable, {});

  const headers = await screen.findAllByRole('columnheader');
  expect(headers).toBeDefined();
  expect(headers.length).toBe(5);
  expect(headers[3].innerHTML).not.toContain('fa-sort-up');
  expect(headers[3].innerHTML).not.toContain('fa-sort-down');
  expect(headers[4].innerHTML).not.toContain('fa-sort-up');
  expect(headers[4].innerHTML).not.toContain('fa-sort-down');
});

test('Expect sorting by name works', async () => {
  render(TestTable, {});

  const nameCol = screen.getByText('Name');
  expect(nameCol).toBeInTheDocument();

  let rows = await screen.findAllByRole('row');
  expect(rows).toBeDefined();
  expect(rows.length).toBe(4);
  expect(rows[1].textContent).toContain('John');
  expect(rows[2].textContent).toContain('Henry');
  expect(rows[3].textContent).toContain('Charlie');

  await fireEvent.click(nameCol);

  rows = await screen.findAllByRole('row');
  expect(rows[1].textContent).toContain('Charlie');
  expect(rows[2].textContent).toContain('Henry');
  expect(rows[3].textContent).toContain('John');
});

test('Expect sorting by age sorts descending initially', async () => {
  render(TestTable, {});

  const ageCol = await screen.findByRole('columnheader', { name: 'Age' });
  expect(ageCol).toBeDefined();

  let rows = await screen.findAllByRole('row');
  expect(rows).toBeDefined();
  expect(rows.length).toBe(4);
  expect(rows[1].textContent).toContain('John');
  expect(rows[2].textContent).toContain('Henry');
  expect(rows[3].textContent).toContain('Charlie');

  await fireEvent.click(ageCol);

  expect(ageCol.innerHTML).toContain('fa-sort-down');

  rows = await screen.findAllByRole('row');
  expect(rows[1].textContent).toContain('John');
  expect(rows[2].textContent).toContain('Charlie');
  expect(rows[3].textContent).toContain('Henry');
});

test('Expect sorting by age twice sorts ascending', async () => {
  render(TestTable, {});

  const ageCol = await screen.findByRole('columnheader', { name: 'Age' });
  expect(ageCol).toBeDefined();

  let rows = await screen.findAllByRole('row');
  expect(rows).toBeDefined();
  expect(rows.length).toBe(4);
  expect(rows[1].textContent).toContain('John');
  expect(rows[2].textContent).toContain('Henry');
  expect(rows[3].textContent).toContain('Charlie');

  await fireEvent.click(ageCol);

  expect(ageCol.innerHTML).toContain('fa-sort-down');

  await fireEvent.click(ageCol);

  expect(ageCol.innerHTML).toContain('fa-sort-up');

  rows = await screen.findAllByRole('row');
  expect(rows[1].textContent).toContain('Henry');
  expect(rows[2].textContent).toContain('Charlie');
  expect(rows[3].textContent).toContain('John');
});

test('Expect correct aria roles', async () => {
  render(TestTable, {});

  // table data is 3 objects with 3 properties, so
  // there should be 5 column headers (expander, checkbox, 3 columns)
  const headers = await screen.findAllByRole('columnheader');
  expect(headers).toBeDefined();
  expect(headers.length).toBe(5);
  expect(headers[2].textContent).toContain('Id');
  expect(headers[3].textContent).toContain('Name');
  expect(headers[4].textContent).toContain('Age');

  // and 4 rows (first is header)
  const rows = await screen.findAllByRole('row');
  expect(rows).toBeDefined();
  expect(rows.length).toBe(4);

  // and each non-header row should have 5 cells (expander, checkbox, 3 cells)
  for (let i = 1; i < 4; i++) {
    const cells = await within(rows[i]).findAllByRole('cell');
    expect(cells).toBeDefined();
    expect(cells.length).toBe(5);
  }
});

test('Expect rowgroups', async () => {
  render(TestTable, {});

  // there should be two role groups
  const rowgroups = await screen.findAllByRole('rowgroup');
  expect(rowgroups).toBeDefined();
  expect(rowgroups.length).toBe(2);

  // one for the header row
  const headers = await within(rowgroups[0]).findAllByRole('columnheader');
  expect(headers).toBeDefined();
  expect(headers.length).toBe(5);

  // and one for the data rows
  const dataRows = await within(rowgroups[1]).findAllByRole('row');
  expect(dataRows).toBeDefined();
  expect(dataRows.length).toBe(3);
});
