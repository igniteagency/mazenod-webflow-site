import { describe, expect, test } from 'bun:test';

import { runDialogButtonCommand, runDialogCommand } from '../src/components/dialog';

function createDialog(open = false) {
  return {
    open,
    canceledEventTypes: new Set(),
    closeCalls: 0,
    closeValue: undefined,
    dispatchedEvents: [],
    isConnected: true,
    requestCloseCalls: 0,
    requestCloseValue: undefined,
    returnValue: '',
    showModalCalls: 0,
    close(value) {
      this.closeCalls += 1;
      this.closeValue = value;
      if (value !== undefined) this.returnValue = value;
      this.open = false;
    },
    dispatchEvent(event) {
      this.dispatchedEvents.push(event);
      return !this.canceledEventTypes.has(event.type);
    },
    requestClose(value) {
      this.requestCloseCalls += 1;
      this.requestCloseValue = value;
      this.open = false;
    },
    showModal() {
      this.showModalCalls += 1;
      this.open = true;
    },
  };
}

function createButton(value = '', hasValue = false) {
  return {
    value,
    hasAttribute(name) {
      return name === 'value' && hasValue;
    },
  };
}

describe('runDialogCommand', () => {
  test('opens a closed dialog modally without reopening it', () => {
    const dialog = createDialog();

    runDialogCommand(dialog, 'show-modal');
    runDialogCommand(dialog, 'show-modal');

    expect(dialog.open).toBe(true);
    expect(dialog.showModalCalls).toBe(1);
  });

  test('passes the command button value when closing', () => {
    const dialog = createDialog(true);

    runDialogCommand(dialog, 'close', 'confirmed');
    runDialogCommand(dialog, 'close', 'ignored');

    expect(dialog.open).toBe(false);
    expect(dialog.closeCalls).toBe(1);
    expect(dialog.closeValue).toBe('confirmed');
  });

  test('passes the command button value when requesting close', () => {
    const dialog = createDialog(true);

    runDialogCommand(dialog, 'request-close', 'cancelled');

    expect(dialog.open).toBe(false);
    expect(dialog.requestCloseCalls).toBe(1);
    expect(dialog.requestCloseValue).toBe('cancelled');
  });

  test('dispatches a cancelable cancel event before requestClose fallback', () => {
    const dialog = createDialog(true);
    dialog.requestClose = undefined;

    runDialogCommand(dialog, 'request-close', 'fallback');

    expect(dialog.open).toBe(false);
    expect(dialog.closeCalls).toBe(1);
    expect(dialog.closeValue).toBe('fallback');
    expect(dialog.dispatchedEvents).toHaveLength(1);
    expect(dialog.dispatchedEvents[0].type).toBe('cancel');
    expect(dialog.dispatchedEvents[0].cancelable).toBe(true);
  });

  test('honours cancellation of the requestClose fallback', () => {
    const dialog = createDialog(true);
    dialog.requestClose = undefined;
    dialog.canceledEventTypes.add('cancel');
    dialog.returnValue = 'existing';

    runDialogCommand(dialog, 'request-close', 'blocked');

    expect(dialog.open).toBe(true);
    expect(dialog.closeCalls).toBe(0);
    expect(dialog.returnValue).toBe('existing');
  });
});

describe('runDialogButtonCommand', () => {
  test('preserves returnValue when the button has no value attribute', () => {
    const dialog = createDialog(true);
    dialog.returnValue = 'existing';

    runDialogButtonCommand(dialog, createButton(), 'close');

    expect(dialog.returnValue).toBe('existing');
    expect(dialog.closeValue).toBeUndefined();
  });

  test('passes an explicitly empty value', () => {
    const dialog = createDialog(true);
    dialog.returnValue = 'existing';

    runDialogButtonCommand(dialog, createButton('', true), 'close');

    expect(dialog.returnValue).toBe('');
    expect(dialog.closeValue).toBe('');
  });

  test('dispatches a cancelable command event before acting', () => {
    const dialog = createDialog(true);
    const button = createButton('dismissed', true);

    runDialogButtonCommand(dialog, button, 'close');

    expect(dialog.dispatchedEvents).toHaveLength(1);
    expect(dialog.dispatchedEvents[0].type).toBe('command');
    expect(dialog.dispatchedEvents[0].cancelable).toBe(true);
    expect(dialog.dispatchedEvents[0].command).toBe('close');
    expect(dialog.dispatchedEvents[0].source).toBe(button);
    expect(dialog.closeCalls).toBe(1);
  });

  test('does not act when the command event is canceled', () => {
    const dialog = createDialog(true);
    dialog.canceledEventTypes.add('command');

    runDialogButtonCommand(dialog, createButton('dismissed', true), 'close');

    expect(dialog.open).toBe(true);
    expect(dialog.closeCalls).toBe(0);
  });
});
