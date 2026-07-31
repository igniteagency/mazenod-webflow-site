import { describe, expect, test } from 'bun:test';

import { runDialogCommand } from '../src/components/dialog';

function createDialog(open = false) {
  return {
    open,
    cancelRequest: false,
    closeCalls: 0,
    closeValue: undefined,
    dispatchedEvents: [],
    requestCloseCalls: 0,
    requestCloseValue: undefined,
    returnValue: '',
    showModalCalls: 0,
    close(value) {
      this.closeCalls += 1;
      this.closeValue = value;
      this.open = false;
    },
    dispatchEvent(event) {
      this.dispatchedEvents.push(event);
      return !this.cancelRequest;
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
    dialog.cancelRequest = true;
    dialog.returnValue = 'existing';

    runDialogCommand(dialog, 'request-close', 'blocked');

    expect(dialog.open).toBe(true);
    expect(dialog.closeCalls).toBe(0);
    expect(dialog.returnValue).toBe('existing');
  });
});
