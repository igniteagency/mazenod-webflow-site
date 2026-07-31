type DialogCommand = 'close' | 'request-close' | 'show-modal';

const DIALOG_COMMANDS: DialogCommand[] = ['close', 'request-close', 'show-modal'];

function isDialogCommand(command: string | null): command is DialogCommand {
  return DIALOG_COMMANDS.includes(command as DialogCommand);
}

export function runDialogCommand(
  dialogEl: HTMLDialogElement,
  command: DialogCommand,
  returnValue?: string
) {
  switch (command) {
    case 'show-modal':
      if (!dialogEl.open) dialogEl.showModal();
      break;
    case 'close':
      if (!dialogEl.open) return;
      if (returnValue === undefined) dialogEl.close();
      else dialogEl.close(returnValue);
      break;
    case 'request-close':
      if (!dialogEl.open) return;
      if (typeof dialogEl.requestClose !== 'function') {
        const cancelEvent = new Event('cancel', { cancelable: true });
        if (!dialogEl.dispatchEvent(cancelEvent)) return;
        if (returnValue === undefined) dialogEl.close();
        else dialogEl.close(returnValue);
        return;
      }
      if (returnValue === undefined) dialogEl.requestClose();
      else dialogEl.requestClose(returnValue);
      break;
  }
}

/**
 * Native-first dialog controls.
 * Polyfills invoker commands and temporarily supports legacy data-dialog attributes.
 * Dialog animation remains entirely in CSS and degrades to an instant state change.
 */
class Dialog {
  private readonly supportsNativeCommands =
    'commandForElement' in HTMLButtonElement.prototype && 'command' in HTMLButtonElement.prototype;

  constructor() {
    document.addEventListener('click', this.handleClick);
  }

  private handleClick = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;

    const commandButton = event.target.closest<HTMLButtonElement>('button[commandfor][command]');

    if (commandButton) {
      if (this.supportsNativeCommands) return;

      event.preventDefault();

      const command = commandButton.getAttribute('command');
      const dialogEl = this.findDialog(commandButton.getAttribute('commandfor'));

      if (dialogEl && isDialogCommand(command)) {
        runDialogCommand(dialogEl, command, commandButton.value);
      }
      return;
    }

    const legacyTrigger = event.target.closest<HTMLElement>(
      '[data-dialog-open], [data-dialog-close]'
    );

    if (!legacyTrigger) return;

    event.preventDefault();

    const openId = legacyTrigger.getAttribute('data-dialog-open');
    const closeId = legacyTrigger.getAttribute('data-dialog-close');
    const dialogEl = this.findDialog(openId || closeId);

    if (!dialogEl) return;

    runDialogCommand(dialogEl, openId ? 'show-modal' : 'close');
  };

  private findDialog(id: string | null) {
    if (!id) return null;

    const targetEl = document.getElementById(id);
    if (targetEl instanceof HTMLDialogElement) return targetEl;

    return (
      Array.from(document.querySelectorAll<HTMLDialogElement>('dialog[data-dialog-id]')).find(
        (dialogEl) => dialogEl.getAttribute('data-dialog-id') === id
      ) ?? null
    );
  }
}

export default Dialog;
