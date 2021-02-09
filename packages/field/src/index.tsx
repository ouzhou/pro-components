import React, { useContext } from 'react';
import { Avatar } from 'antd';
import type {
  ProFieldValueType,
  ProFieldValueObjectType,
  BaseProFieldFC,
  ProRenderFieldPropsType,
  ProFieldFCRenderProps,
  ProFieldTextType,
} from '@ant-design/pro-utils';
import { pickProProps, omitUndefined } from '@ant-design/pro-utils';

import ConfigContext, { useIntl } from '@ant-design/pro-provider';
import FieldPercent from './components/Percent';
import FieldIndexColumn from './components/IndexColumn';
import FieldProgress from './components/Progress';
import FieldMoney from './components/Money';
import FieldDatePicker from './components/DatePicker';
import FieldFromNow from './components/FromNow';
import FieldRangePicker from './components/RangePicker';
import FieldCode from './components/Code';
import FieldTimePicker, { FieldTimeRangePicker } from './components/TimePicker';
import FieldText from './components/Text';
import FieldTextArea from './components/TextArea';
import FieldPassword from './components/Password';
import FieldStatus from './components/Status';
import FieldOptions from './components/Options';
import FiledSelect, {
  proFieldParsingText,
  proFieldParsingValueEnumToArray,
} from './components/Select';
import FiledCheckbox from './components/Checkbox';
import FiledRate from './components/Rate';
import FiledSwitch from './components/Switch';
import FieldDigit from './components/Digit';
import FieldSecond from './components/Second';

import FieldRadio from './components/Radio';
import FieldImage from './components/Image';

export type ProFieldEmptyText = string | false;

/** 默认的 Field 需要实现的功能 */
export type ProFieldFC<T> = React.ForwardRefRenderFunction<
  any,
  BaseProFieldFC & ProRenderFieldPropsType & T
>;

/** Value type by function */
export type ProFieldValueTypeFunction<T> = (item: T) => ProFieldValueType | ProFieldValueObjectType;

type RenderProps = Omit<ProFieldFCRenderProps, 'text'> &
  ProRenderFieldPropsType & {
    emptyText?: React.ReactNode;
    visible?: boolean;
    onVisible?: (visible: boolean) => void;
    [key: string]: any;
  };

/**
 * Render valueType object
 *
 * @param text String | number
 * @param valueType ProColumnsValueObjectType
 */
const defaultRenderTextByObject = (
  text: ProFieldTextType,
  valueType: ProFieldValueObjectType,
  props: RenderProps,
) => {
  const pickFormItemProps = pickProProps(props.fieldProps);
  if (valueType.type === 'progress') {
    return (
      <FieldProgress
        {...props}
        text={text as number}
        fieldProps={{
          status: valueType.status ? valueType.status : undefined,
          ...pickFormItemProps,
        }}
      />
    );
  }
  if (valueType.type === 'money') {
    return (
      <FieldMoney
        locale={valueType.locale}
        {...props}
        fieldProps={pickFormItemProps}
        text={text as number}
        moneySymbol={valueType.moneySymbol}
      />
    );
  }
  if (valueType.type === 'percent') {
    return (
      <FieldPercent
        {...props}
        text={text as number}
        showSymbol={valueType.showSymbol}
        precision={valueType.precision}
        fieldProps={pickFormItemProps}
        showColor={valueType.showColor}
      />
    );
  }

  if (valueType.type === 'image') {
    return <FieldImage {...props} text={text as string} width={valueType.width} />;
  }
  return text;
};

/**
 * 根据不同的类型来转化数值
 *
 * @param text
 * @param valueType
 */
const defaultRenderText = (
  text: ProFieldTextType,
  valueType: ProFieldValueType | ProFieldValueObjectType,
  props: RenderProps,
  valueTypeMap: Record<string, ProRenderFieldPropsType>,
): React.ReactNode => {
  if (typeof valueType === 'object') {
    return defaultRenderTextByObject(text, valueType, props);
  }
  const { mode = 'read', emptyText = '-' } = props;

  const customValueTypeConfig = valueTypeMap && valueTypeMap[valueType as string];
  if (customValueTypeConfig) {
    // eslint-disable-next-line no-param-reassign
    delete props.ref;
    if (mode === 'read') {
      return customValueTypeConfig.render?.(
        text,
        {
          text,
          ...props,
          mode: mode || 'read',
        },
        <>{text}</>,
      );
    }
    if (mode === 'update' || mode === 'edit') {
      return customValueTypeConfig.renderFormItem?.(
        text,
        {
          text,
          ...props,
        },
        <>{text}</>,
      );
    }
  }

  if (emptyText !== false && mode === 'read' && valueType !== 'option' && valueType !== 'switch') {
    if (typeof text !== 'boolean' && typeof text !== 'number' && !text) {
      const { fieldProps, render } = props;
      if (render) {
        return render(text, { mode, ...fieldProps }, <>{emptyText}</>);
      }
      return <>{emptyText}</>;
    }
  }

  // eslint-disable-next-line no-param-reassign
  delete props.emptyText;

  /** 如果是金额的值 */
  if (valueType === 'money') {
    return <FieldMoney {...props} text={text as number} />;
  }

  /** 如果是日期的值 */
  if (valueType === 'date') {
    return <FieldDatePicker text={text as string} format="YYYY-MM-DD" {...props} />;
  }

  /** 如果是周的值 */
  if (valueType === 'dateWeek') {
    return <FieldDatePicker text={text as string} format="YYYY-wo" picker="week" {...props} />;
  }

  /** 如果是月的值 */
  if (valueType === 'dateMonth') {
    return <FieldDatePicker text={text as string} format="YYYY-MM" picker="month" {...props} />;
  }

  /** 如果是季度的值 */
  if (valueType === 'dateQuarter') {
    return <FieldDatePicker text={text as string} format="YYYY-\QQ" picker="quarter" {...props} />;
  }

  /** 如果是年的值 */
  if (valueType === 'dateYear') {
    return <FieldDatePicker text={text as string} format="YYYY" picker="year" {...props} />;
  }

  /** 如果是日期范围的值 */
  if (valueType === 'dateRange') {
    return <FieldRangePicker text={text as string[]} format="YYYY-MM-DD" {...props} />;
  }

  /** 如果是日期加时间类型的值 */
  if (valueType === 'dateTime') {
    return (
      <FieldDatePicker text={text as string} format="YYYY-MM-DD HH:mm:ss" showTime {...props} />
    );
  }

  /** 如果是日期加时间类型的值的值 */
  if (valueType === 'dateTimeRange') {
    // 值不存在的时候显示 "-"
    return (
      <FieldRangePicker text={text as string[]} format="YYYY-MM-DD HH:mm:ss" showTime {...props} />
    );
  }

  /** 如果是时间类型的值 */
  if (valueType === 'time') {
    return <FieldTimePicker text={text as string} format="HH:mm:ss" {...props} />;
  }

  /** 如果是时间类型的值 */
  if (valueType === 'timeRange') {
    return <FieldTimeRangePicker text={text as string[]} format="HH:mm:ss" {...props} />;
  }

  if (valueType === 'fromNow') {
    return <FieldFromNow text={text as string} {...props} />;
  }

  if (valueType === 'index') {
    return <FieldIndexColumn>{(text as number) + 1}</FieldIndexColumn>;
  }

  if (valueType === 'indexBorder') {
    return <FieldIndexColumn border>{(text as number) + 1}</FieldIndexColumn>;
  }

  if (valueType === 'progress') {
    return <FieldProgress {...props} text={text as number} />;
  }
  /** 百分比, 默认展示符号, 不展示小数位 */
  if (valueType === 'percent') {
    return <FieldPercent text={text as number} {...props} />;
  }

  if (valueType === 'avatar' && typeof text === 'string' && props.mode === 'read') {
    return <Avatar src={text as string} size={22} shape="circle" />;
  }

  if (valueType === 'code') {
    return <FieldCode text={text as string} {...props} />;
  }

  if (valueType === 'jsonCode') {
    return <FieldCode text={text as string} language="json" {...props} />;
  }

  if (valueType === 'textarea') {
    return <FieldTextArea text={text as string} {...props} />;
  }

  if (valueType === 'digit') {
    return <FieldDigit text={text as number} {...props} />;
  }

  if (valueType === 'second') {
    return <FieldSecond text={text as number} {...props} />;
  }

  if (valueType === 'select' || (valueType === 'text' && (props.valueEnum || props.request))) {
    return <FiledSelect text={text as string} {...props} />;
  }

  if (valueType === 'checkbox') {
    return <FiledCheckbox text={text as string} {...props} />;
  }

  if (valueType === 'radio') {
    return <FieldRadio text={text as string} {...props} />;
  }

  if (valueType === 'radioButton') {
    return <FieldRadio radioType="button" text={text as string} {...props} />;
  }

  if (valueType === 'rate') {
    return <FiledRate text={text as string} {...props} />;
  }
  if (valueType === 'switch') {
    return <FiledSwitch text={text as boolean} {...props} />;
  }

  if (valueType === 'option') {
    return <FieldOptions text={text} {...props} />;
  }

  if (valueType === 'password') {
    return <FieldPassword text={text as string} {...props} />;
  }

  if (valueType === 'image') {
    return <FieldImage text={text as string} {...props} />;
  }

  return <FieldText text={text as string} {...props} />;
};

export { defaultRenderText };

/** ProField 的类型 */
export type ProFieldPropsType = {
  text?: ProFieldTextType;
  valueType?: ProFieldValueType | ProFieldValueObjectType;
} & RenderProps;

const ProField: React.ForwardRefRenderFunction<any, ProFieldPropsType> = (
  { text, valueType = 'text', onChange, value, ...rest },
  ref,
) => {
  const intl = useIntl();
  const context = useContext(ConfigContext);

  const fieldProps = (value || onChange || rest?.fieldProps) && {
    value,
    // fieldProps 优先级更高，在类似 LightFilter 场景下需要覆盖默认的 value 和 onChange
    ...omitUndefined(rest?.fieldProps),
    onChange: (...restParams: any[]) => {
      onChange?.(...restParams);
      rest?.fieldProps?.onChange?.(...restParams);
    },
  };
  return (
    <React.Fragment>
      {defaultRenderText(
        text ?? fieldProps?.value ?? '',
        valueType || 'text',
        {
          ...rest,
          mode: rest.mode || 'read',
          ref,
          placeholder: intl.getMessage('tableForm.inputPlaceholder', '请输入'),
          fieldProps: pickProProps(fieldProps),
        },
        context.valueTypeMap,
      )}
    </React.Fragment>
  );
};

export {
  FieldPercent,
  FieldIndexColumn,
  FieldProgress,
  FieldMoney,
  FieldDatePicker,
  FieldRangePicker,
  FieldCode,
  FieldTimePicker,
  FieldText,
  FieldStatus,
  FiledSelect,
  proFieldParsingText,
  proFieldParsingValueEnumToArray,
};

export type { ProFieldValueType };

export default React.forwardRef(ProField) as typeof ProField;
