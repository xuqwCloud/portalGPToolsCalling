import React from 'react';
import { loadModules } from 'esri-loader';
import $ from 'jquery';
import './App.css';

const options = {
    url: 'https://esricdxuqw.arcgis.cn/4.14/init.js',
    css: 'https://esricdxuqw.arcgis.cn/4.14/esri/themes/light/main.css',
};

class App extends React.Component {
    componentDidMount = () => {
        const _self = this;
        loadModules(
            ['esri/views/MapView', 'esri/Map', 'esri/Basemap', 'esri/layers/TileLayer', 'esri/layers/FeatureLayer'],
            options,
        )
            .then(([MapView, Map, Basemap, TileLayer, FeatureLayer]) => {
                let basemap = new Basemap({
                    baseLayers: [
                        new TileLayer({
                            url: 'http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer',
                            title: '蓝黑色中国基础地图',
                        }),
                    ],
                    title: '蓝黑色中国基础地图',
                    id: 'ChinaOnlineStreetPurplishBlue',
                });

                let map = new Map({
                    basemap: basemap,
                });
                let view = new MapView({
                    container: 'mapView',
                    map: map,
                    zoom: 5,
                    center: [106.548204, 34.213143],
                });

                //添加测试图层
                let layer = new FeatureLayer({
                    url: 'https://esricdxuqw.arcgis.cn/arcgis/rest/services/Hosted/provinceData/FeatureServer',
                });
                map.add(layer);

                view.ui.components = [];
            })
            .catch((err) => {
                console.log('底图创建失败，' + err);
            });
    };

    _analystBuffer = () => {
        let url = $('#layerUrl').val();
        let length = $('#lenth').val();
        let type = $('#type').val();
        let name = $('#resultName').val();
        let portalHost = 'https://esricdxuqw.arcgis.cn/';
        let username = 'arcgis';
        let password = 'xqw351627XQW';

        console.log(url, length, type, name);
        //生成token
        $.ajax({
            url: portalHost + 'arcgis/sharing/rest/generateToken',
            type: 'post',
            data: {
                username: username,
                password: password,
                client: 'referer',
                referer: 'http://localhost',
                f: 'json',
            },
            dataType: 'json',
            async: true,
            success: function (result01) {
                console.log(result01);
                let token = result01.token;

                //访问当前用户
                $.ajax({
                    url: portalHost + 'arcgis/sharing/rest/community/users/' + username,
                    type: 'get',
                    data: {
                        token: token,
                        f: 'json',
                    },
                    dataType: 'json',
                    async: true,
                    success: function (result02) {
                        console.log(result02);

                        //验证结果图层名称是否可用
                        $.ajax({
                            url: portalHost + 'arcgis/sharing/rest/portals/0123456789ABCDEF/isServiceNameAvailable',
                            type: 'get',
                            data: {
                                name: name.toString(),
                                type: 'Feature Service',
                                token: token,
                                f: 'json',
                            },
                            dataType: 'json',
                            async: true,
                            success: function (result03) {
                                console.log(result03);

                                if (result03.available) {
                                    //创建一个空服务
                                    $.ajax({
                                        url:
                                            portalHost +
                                            'arcgis/sharing/rest/content/users/' +
                                            username +
                                            '/createService',
                                        type: 'post',
                                        data: {
                                            createParameters: JSON.stringify({
                                                currentVersion: 10.2,
                                                serviceDescription: '',
                                                hasVersionedData: false,
                                                supportsDisconnectedEditing: false,
                                                hasStaticData: true,
                                                maxRecordCount: 2000,
                                                supportedQueryFormats: 'JSON',
                                                capabilities: 'Query',
                                                description: '',
                                                copyrightText: '',
                                                allowGeometryUpdates: false,
                                                syncEnabled: false,
                                                editorTrackingInfo: {
                                                    enableEditorTracking: false,
                                                    enableOwnershipAccessControl: false,
                                                    allowOthersToUpdate: true,
                                                    allowOthersToDelete: true,
                                                },
                                                xssPreventionInfo: {
                                                    xssPreventionEnabled: true,
                                                    xssPreventionRule: 'InputOnly',
                                                    xssInputRule: 'rejectInvalid',
                                                },
                                                tables: [],
                                                name: name.toString(),
                                            }),
                                            outputType: 'featureService',
                                            token: token,
                                            f: 'json',
                                        },
                                        dataType: 'json',
                                        async: true,
                                        success: function (result04) {
                                            console.log(result04);
                                            if (result04.success) {
                                                //创建缓冲区gp
                                                let emptyServerUrl = result04.serviceurl;
                                                let emptyServerID = result04.serviceItemId;
                                                let emptyServerName = result04.name;
                                                $.ajax({
                                                    url:
                                                        portalHost +
                                                        'arcgis/rest/services/System/SpatialAnalysisTools/GPServer/CreateBuffers/submitJob',
                                                    type: 'get',
                                                    data: {
                                                        inputLayer: JSON.stringify({
                                                            url: url,
                                                            name: 'proviceCity-省会城市',
                                                        }),
                                                        dissolveType: 'None',
                                                        distances: '[' + Number(length) + ']',
                                                        units: 'Kilometers',
                                                        ringType: 'Rings',
                                                        OutputName: JSON.stringify({
                                                            serviceProperties: {
                                                                name: emptyServerName,
                                                                serviceUrl: emptyServerUrl,
                                                            },
                                                            itemProperties: {
                                                                itemId: emptyServerID,
                                                            },
                                                        }),
                                                        context: JSON.stringify({
                                                            extent: {
                                                                xmin: 9178815.369706942,
                                                                ymin: 1577063.515676413,
                                                                xmax: 16404254.77944616,
                                                                ymax: 5671642.246855646,
                                                                spatialReference: {
                                                                    wkid: 102100,
                                                                    latestWkid: 3857,
                                                                },
                                                            },
                                                        }),
                                                        token: token,
                                                        f: 'json',
                                                    },
                                                    dataType: 'json',
                                                    async: true,
                                                    success: function (result05) {
                                                        console.log(result05);
                                                        let jobID = result05.jobId;
                                                        //使用itemid访问创建的服务
                                                        $.ajax({
                                                            url:
                                                                portalHost +
                                                                'arcgis/sharing/rest/content/users/' +
                                                                username +
                                                                '/items/' +
                                                                emptyServerID,
                                                            type: 'get',
                                                            data: {
                                                                token: token,
                                                                f: 'json',
                                                            },
                                                            dataType: 'json',
                                                            async: true,
                                                            success: function (result06) {
                                                                console.log(result06);

                                                                //更新创建的服务
                                                                $.ajax({
                                                                    url:
                                                                        portalHost +
                                                                        'arcgis/sharing/rest/content/users/' +
                                                                        username +
                                                                        '/items/' +
                                                                        emptyServerID +
                                                                        '/update',
                                                                    type: 'post',
                                                                    data: {
                                                                        description:
                                                                            '通过运行缓冲要素解决方案而生成的要素图层。',
                                                                        tags: '分析结果、缓冲区、proviceCity-省会城市',
                                                                        snippet: '通过缓冲区生成的要素图层',
                                                                        folder: '',
                                                                        properties: JSON.stringify({
                                                                            jobUrl:
                                                                                portalHost +
                                                                                'arcgis/rest/services/System/SpatialAnalysisTools/GPServer/CreateBuffers/jobs/' +
                                                                                jobID,
                                                                            jobType: 'GPServer',
                                                                            jobId: jobID,
                                                                            jobStatus: 'processing',
                                                                        }),
                                                                        token: token,
                                                                        f: 'json',
                                                                    },
                                                                    dataType: 'json',
                                                                    async: true,
                                                                    success: function (result07) {
                                                                        console.log(result07);

                                                                        if (result07.success) {
                                                                            //运行gp
                                                                            let timer = setInterval(function () {
                                                                                $.ajax({
                                                                                    url:
                                                                                        portalHost +
                                                                                        'arcgis/rest/services/System/SpatialAnalysisTools/GPServer/CreateBuffers/jobs/' +
                                                                                        jobID,
                                                                                    type: 'get',
                                                                                    data: {
                                                                                        token: token,
                                                                                        f: 'json',
                                                                                    },
                                                                                    dataType: 'json',
                                                                                    async: true,
                                                                                    success: function (result08) {
                                                                                        console.log(result08);
                                                                                        if (
                                                                                            result08.jobStatus ==
                                                                                            'esriJobFailed'
                                                                                        ) {
                                                                                            console.log(
                                                                                                '缓冲区执行失败',
                                                                                            );
                                                                                            clearInterval(timer);
                                                                                        } else if (
                                                                                            result08.jobStatus ==
                                                                                            'esriJobSucceeded'
                                                                                        ) {
                                                                                            console.log(
                                                                                                '缓冲区执行成功',
                                                                                            );
                                                                                            clearInterval(timer);
                                                                                        }
                                                                                    },
                                                                                    error: function (err08) {
                                                                                        console.log(
                                                                                            'gp执行报错:',
                                                                                            err08,
                                                                                        );
                                                                                    },
                                                                                });
                                                                            }, 1000);
                                                                        } else {
                                                                            console.log('更新创建的服务失败');
                                                                        }
                                                                    },
                                                                    error: function (err07) {
                                                                        console.log('更新创建的服务报错:', err07);
                                                                    },
                                                                });
                                                            },
                                                            error: function (err06) {
                                                                console.log('使用itemid访问创建的服务报错:', err06);
                                                            },
                                                        });
                                                    },
                                                    error: function (err05) {
                                                        console.log('创建缓冲区gp报错:', err05);
                                                    },
                                                });
                                            } else {
                                                console.log('空服务创建失败!');
                                            }
                                        },
                                        error: function (err04) {
                                            console.log('创建一个空服务报错:', err04);
                                        },
                                    });
                                } else {
                                    console.log('当前输入结果图层名称不可用!');
                                }
                            },
                            error: function (err03) {
                                console.log('验证结果图层名称报错:', err03);
                            },
                        });
                    },
                    error: function (err02) {
                        console.log('当前用户访问报错:', err02);
                    },
                });
            },
            error: function (err01) {
                console.log('token生成报错:', err01);
            },
        });
    };

    render() {
        return (
            <div className="mainView">
                <div className="mapView" id="mapView">
                    <div className="toolView">
                        <span>输入图层地址：</span>
                        <br />
                        <input
                            type="text"
                            id="layerUrl"
                            value="https://esricdxuqw.arcgis.cn/arcgis/rest/services/Hosted/provinceData/FeatureServer/0"
                        />
                        <br />
                        <span>输入缓冲距离：</span>
                        <br />
                        <input type="text" id="lenth" />
                        <br />
                        <span>缓冲类型：</span>
                        <br />
                        <input type="text" id="type" />
                        <br />
                        <span>结果图层名称：</span>
                        <br />
                        <input type="text" id="resultName" />
                        <br />
                        <br />

                        <button onClick={this._analystBuffer}>执行缓冲区分析</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
