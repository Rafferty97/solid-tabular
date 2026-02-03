import type { Component, ComponentProps, JSX, ValidComponent } from 'solid-js'
import { splitProps } from 'solid-js'
import * as ContextMenuPrimitive from '@kobalte/core/context-menu'
import type { PolymorphicProps } from '@kobalte/core/polymorphic'
import { cn } from 'src/lib/classnames'
import './ContextMenu.css'

const ContextMenuTrigger = ContextMenuPrimitive.Trigger
const ContextMenuPortal = ContextMenuPrimitive.Portal
const ContextMenuSub = ContextMenuPrimitive.Sub
const ContextMenuGroup = ContextMenuPrimitive.Group
const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup

const ContextMenu: Component<ContextMenuPrimitive.ContextMenuRootProps> = props => {
  return <ContextMenuPrimitive.Root gutter={4} {...props} />
}

type ContextMenuContentProps<T extends ValidComponent = 'div'> =
  ContextMenuPrimitive.ContextMenuContentProps<T> & {
    class?: string | undefined
  }

const ContextMenuContent = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, ContextMenuContentProps<T>>,
) => {
  const [local, others] = splitProps(props as ContextMenuContentProps, ['class'])
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content class={cn('context-menu__content', local.class)} {...others} />
    </ContextMenuPrimitive.Portal>
  )
}

type ContextMenuItemProps<T extends ValidComponent = 'div'> =
  ContextMenuPrimitive.ContextMenuItemProps<T> & {
    class?: string | undefined
  }

const ContextMenuItem = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, ContextMenuItemProps<T>>,
) => {
  const [local, others] = splitProps(props as ContextMenuItemProps, ['class'])
  return <ContextMenuPrimitive.Item class={cn('context-menu__item', local.class)} {...others} />
}

const ContextMenuShortcut: Component<ComponentProps<'span'>> = props => {
  const [local, others] = splitProps(props, ['class'])
  return <span class={cn('context-menu__shortcut', local.class)} {...others} />
}

type ContextMenuSeparatorProps<T extends ValidComponent = 'hr'> =
  ContextMenuPrimitive.ContextMenuSeparatorProps<T> & {
    class?: string | undefined
  }

const ContextMenuSeparator = <T extends ValidComponent = 'hr'>(
  props: PolymorphicProps<T, ContextMenuSeparatorProps<T>>,
) => {
  const [local, others] = splitProps(props as ContextMenuSeparatorProps, ['class'])
  return (
    <ContextMenuPrimitive.Separator
      class={cn('context-menu__separator', local.class)}
      {...others}
    />
  )
}

type ContextMenuSubTriggerProps<T extends ValidComponent = 'div'> =
  ContextMenuPrimitive.ContextMenuSubTriggerProps<T> & {
    class?: string | undefined
    children?: JSX.Element
  }

const ContextMenuSubTrigger = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, ContextMenuSubTriggerProps<T>>,
) => {
  const [local, others] = splitProps(props as ContextMenuSubTriggerProps, ['class', 'children'])
  return (
    <ContextMenuPrimitive.SubTrigger
      class={cn('context-menu__sub-trigger', local.class)}
      {...others}
    >
      {local.children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="context-menu__icon-right"
      >
        <path d="M9 6l6 6l-6 6" />
      </svg>
    </ContextMenuPrimitive.SubTrigger>
  )
}

type ContextMenuSubContentProps<T extends ValidComponent = 'div'> =
  ContextMenuPrimitive.ContextMenuSubContentProps<T> & {
    class?: string | undefined
  }

const ContextMenuSubContent = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, ContextMenuSubContentProps<T>>,
) => {
  const [local, others] = splitProps(props as ContextMenuSubContentProps, ['class'])
  return (
    <ContextMenuPrimitive.SubContent class={cn('context-menu__content', local.class)} {...others} />
  )
}

type ContextMenuCheckboxItemProps<T extends ValidComponent = 'div'> =
  ContextMenuPrimitive.ContextMenuCheckboxItemProps<T> & {
    class?: string | undefined
    children?: JSX.Element
  }

const ContextMenuCheckboxItem = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, ContextMenuCheckboxItemProps<T>>,
) => {
  const [local, others] = splitProps(props as ContextMenuCheckboxItemProps, ['class', 'children'])
  return (
    <ContextMenuPrimitive.CheckboxItem
      class={cn('context-menu__checkbox-item', local.class)}
      {...others}
    >
      <span class="context-menu__item-indicator">
        <ContextMenuPrimitive.ItemIndicator>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M5 12l5 5l10 -10" />
          </svg>
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {local.children}
    </ContextMenuPrimitive.CheckboxItem>
  )
}

type ContextMenuGroupLabelProps<T extends ValidComponent = 'span'> =
  ContextMenuPrimitive.ContextMenuGroupLabelProps<T> & {
    class?: string | undefined
  }

const ContextMenuGroupLabel = <T extends ValidComponent = 'span'>(
  props: PolymorphicProps<T, ContextMenuGroupLabelProps<T>>,
) => {
  const [local, others] = splitProps(props as ContextMenuGroupLabelProps, ['class'])
  return (
    <ContextMenuPrimitive.GroupLabel
      class={cn('context-menu__group-label', local.class)}
      {...others}
    />
  )
}

type ContextMenuRadioItemProps<T extends ValidComponent = 'div'> =
  ContextMenuPrimitive.ContextMenuRadioItemProps<T> & {
    class?: string | undefined
    children?: JSX.Element
  }

const ContextMenuRadioItem = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, ContextMenuRadioItemProps<T>>,
) => {
  const [local, others] = splitProps(props as ContextMenuRadioItemProps, ['class', 'children'])
  return (
    <ContextMenuPrimitive.RadioItem class={cn('context-menu__radio-item', local.class)} {...others}>
      <span class="context-menu__item-indicator">
        <ContextMenuPrimitive.ItemIndicator>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
          </svg>
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {local.children}
    </ContextMenuPrimitive.RadioItem>
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuPortal,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuCheckboxItem,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
}
