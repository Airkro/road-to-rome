import React from 'react';

import { Result, Button } from 'antd';

import {
  ModuleMapper as mMapper,
  RouteMapper as rMapper,
} from '@eaphone/road-to-rome-react';

function reload() {
  window.location.reload();
}

const reloadBtn = (
  <Button onClick={reload} type="primary">
    刷新
  </Button>
);

export function PageError() {
  return (
    <Result
      extra={reloadBtn}
      status="500"
      subTitle="请刷新或联系技术支持"
      title="模块功能加载失败"
    />
  );
}

// eslint-disable-next-line react/prop-types
export function Page403({ history: { goBack } }) {
  const btn = (
    <Button onClick={goBack} type="primary">
      返回
    </Button>
  );

  return (
    <Result
      extra={btn}
      status="403"
      subTitle="请检查您的访问地址"
      title="没有此页面的访问权限"
    />
  );
}

// eslint-disable-next-line react/prop-types
export function Page404({ history: { goBack } }) {
  const btn = (
    <Button onClick={goBack} type="primary">
      返回
    </Button>
  );

  return (
    <Result
      extra={btn}
      status="404"
      subTitle="请检查您的访问地址"
      title="目标页面不存在"
    />
  );
}

export function ModuleMapper({ sync, lazy }) {
  return mMapper({
    sync,
    lazy,
    onError: PageError,
  });
}

export function RouteMapper({ components, configs }) {
  return rMapper({
    components,
    configs,
    Page403,
    Page404,
  });
}
