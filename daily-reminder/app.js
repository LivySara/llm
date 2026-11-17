(function () {
    'use strict';

    // ---------- 固定作息任务（单一数据源） ----------
    var TASKS = [
        { id: 'wake',    time: '07:00', title: '起床',           desc: '新的一天，从早起开始',          notify: '该起床啦！别赖床，起来活动一下。' },
        { id: 'leave',   time: '08:00', title: '出门',           desc: '今天必须出门，不要拖延',        notify: '该出门了！检查随身物品，出发。' },
        { id: 'cook',    time: '19:00', title: '开始准备做饭',    desc: '别点外卖，自己动手',            notify: '该准备做饭啦，现在开始动手。' },
        { id: 'study',   time: '21:00', title: '学习英语 / 韩语', desc: '每天进步一点点',               notify: '学习时间到！英语 / 韩语，坚持一会儿。' },
        { id: 'summary', time: '23:00', title: '今日总结',       desc: '记录今天到底干了什么',          notify: '该做今日总结了：今天完成了什么？' },
        { id: 'sleep',   time: '23:30', title: '准备睡觉',       desc: '00:00 前入睡 · 跨零点算前一天', notify: '该准备睡觉了，放下手机，00:00 前入睡。' }
    ];

    var STORAGE_KEY = 'daily-reminder:v1';
    var DAY_WRAP_HOUR = 4;   // 00:00–04:00 归属前一天
    var DEADLINE_MIN = 1440; // 00:00 入睡截止（延续为前一天的 1440 分钟）

    var state = loadState();
    var notified = Object.create(null);
    var lastDayKey = '';
    var lastSignature = '';
    var suppressUntilNow = false;
    var toastTimer = null;
    var view = null;

    TASKS.forEach(function (t) { t.minutes = toMinutes(t.time); });

    // ---------- 基础工具 ----------
    function pad(n) { return String(n).padStart(2, '0'); }

    function toMinutes(s) {
        var p = s.split(':');
        return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
    }

    function formatDayKey(d) {
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }

    function humanDuration(mins) {
        var m = Math.max(0, Math.floor(mins));
        if (m < 1) return '不到 1 分钟';
        var h = Math.floor(m / 60);
        var mm = m % 60;
        return h > 0 ? h + ' 小时' + (mm ? ' ' + mm + ' 分钟' : '') : mm + ' 分钟';
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    // 00:00–04:00 归属前一天，并把分钟延续到 1440 以后，便于判定跨午夜的睡觉项
    function dayInfo(now) {
        var d = new Date(now);
        var h = d.getHours();
        var mins = h * 60 + d.getMinutes() + d.getSeconds() / 60;
        var day = new Date(d);
        var wrapped = h < DAY_WRAP_HOUR;
        if (wrapped) {
            day.setDate(day.getDate() - 1);
            mins += 1440;
        }
        return { dayKey: formatDayKey(day), minutes: mins, wrapped: wrapped };
    }

    // ---------- 本地持久化 ----------
    function loadState() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return { days: {} };
            var parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object' || !parsed.days || typeof parsed.days !== 'object') return { days: {} };
            return { days: parsed.days };
        } catch (e) {
            return { days: {} };
        }
    }

    function saveState() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* 隐私模式等场景静默降级 */ }
    }

    // 每项三态：true=完成，'x'=明确没做，无记录=未打卡
    function markOf(dayKey, id) {
        var day = state.days[dayKey];
        return day ? day[id] : undefined;
    }

    function isDone(dayKey, id) {
        return markOf(dayKey, id) === true;
    }

    function doneCount(dayKey) {
        var n = 0;
        TASKS.forEach(function (t) { if (isDone(dayKey, t.id)) n++; });
        return n;
    }

    function writeMark(dayKey, id, value) {
        if (!state.days[dayKey]) state.days[dayKey] = {};
        if (value === undefined) delete state.days[dayKey][id];
        else state.days[dayKey][id] = value;
        if (Object.keys(state.days[dayKey]).length === 0) delete state.days[dayKey];
        saveState();
    }

    function toggleTask(dayKey, id) {
        writeMark(dayKey, id, markOf(dayKey, id) === true ? undefined : true);
    }

    function toggleFail(dayKey, id) {
        writeMark(dayKey, id, markOf(dayKey, id) === 'x' ? undefined : 'x');
    }

    // ---------- 视图计算 ----------
    function computeView(now) {
        var info = dayInfo(now);
        var candidates = info.wrapped
            ? TASKS.filter(function (t) { return t.id === 'sleep'; })
            : TASKS;
        var pending = candidates.filter(function (t) { return !isDone(info.dayKey, t.id); });

        var current = null;
        for (var i = 0; i < pending.length; i++) {
            if (pending[i].minutes <= info.minutes) { current = pending[i]; break; }
        }
        var next = current ? null : (pending.length ? pending[0] : null);
        var focus = current || next;

        var countdownText;
        if (info.wrapped && focus && focus.id === 'sleep') {
            countdownText = '已过 00:00 入睡截止，请尽快休息';
        } else if (focus) {
            var diff = focus.minutes - info.minutes;
            countdownText = diff > 0
                ? '距开始还有 ' + humanDuration(diff)
                : '已到时间 · 超时 ' + humanDuration(-diff);
        } else {
            countdownText = info.wrapped ? '今天已收尾，去休息吧' : '今天的 6 项都完成了，做得好！';
        }

        var d = new Date(now);
        var week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];

        return {
            info: info,
            current: current,
            next: next,
            focus: focus,
            allDone: pending.length === 0,
            countdownText: countdownText,
            dateLine: d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日 · 周' + week,
            clock: pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()),
            done: doneCount(info.dayKey),
            total: TASKS.length
        };
    }

    // ---------- 统计 ----------
    function lastNDays(n, endKey) {
        var p = endKey.split('-');
        var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10), 12, 0, 0);
        var keys = [];
        for (var i = n - 1; i >= 0; i--) {
            var x = new Date(d);
            x.setDate(x.getDate() - i);
            keys.push(formatDayKey(x));
        }
        return keys;
    }

    function isPerfectDay(key) { return doneCount(key) === TASKS.length; }

    function computeStreak(todayKey) {
        var p = todayKey.split('-');
        var cursor = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10), 12, 0, 0);
        if (!isPerfectDay(todayKey)) cursor.setDate(cursor.getDate() - 1);
        var n = 0;
        while (n < 3650) {
            if (!isPerfectDay(formatDayKey(cursor))) break;
            n++;
            cursor.setDate(cursor.getDate() - 1);
        }
        return n;
    }

    // ---------- 渲染 ----------
    function ringSvg(pct, size, stroke, color) {
        var ratio = Math.max(0, Math.min(1, pct));
        var r = (size - stroke) / 2;
        var c = 2 * Math.PI * r;
        var half = size / 2;
        return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
            '<circle cx="' + half + '" cy="' + half + '" r="' + r + '" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="' + stroke + '"/>' +
            '<circle class="ring-progress" cx="' + half + '" cy="' + half + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + stroke +
            '" stroke-linecap="round" stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + (c * (1 - ratio)).toFixed(2) +
            '" transform="rotate(-90 ' + half + ' ' + half + ')"/></svg>';
    }

    function statusOf(t, v) {
        var mark = markOf(v.info.dayKey, t.id);
        if (mark === true) return { cls: 'done', label: '已完成' };
        if (mark === 'x') return { cls: 'failed', label: '未完成' };
        if (v.current && v.current.id === t.id) return { cls: 'current', label: '进行中' };
        if (!v.info.wrapped && t.minutes <= v.info.minutes) return { cls: 'overdue', label: '未完成' };
        if (v.next && v.next.id === t.id) return { cls: 'next', label: '下一项' };
        return { cls: 'todo', label: '待办' };
    }

    function renderHero(v) {
        var label;
        if (v.current) label = '当前该做';
        else if (v.next) label = '下一项';
        else if (v.allDone) label = '今日已完成';
        else label = '今日已收尾';

        var title, desc;
        if (v.focus) {
            title = v.focus.title;
            desc = v.focus.desc;
        } else if (v.allDone) {
            title = '6 项全部打卡，真棒！';
            desc = '保持节奏，明天继续';
        } else {
            title = '夜深了，去休息吧';
            desc = '未完成的项目可以在清单里补打卡';
        }

        document.getElementById('heroLabel').textContent = label;
        document.getElementById('heroTime').textContent = v.focus ? v.focus.time : '--:--';
        document.getElementById('heroTitle').textContent = title;
        document.getElementById('heroDesc').textContent = desc;
        document.getElementById('countdown').textContent = v.countdownText;
        document.getElementById('progressRing').innerHTML = ringSvg(v.done / v.total, 56, 5, '#22C3A6');

        var action = document.getElementById('heroAction');
        action.hidden = !v.focus;
        if (v.focus) action.textContent = '✓ 一键完成「' + v.focus.title + '」';
    }

    function renderTimeline(v) {
        var html = TASKS.map(function (t) {
            var s = statusOf(t, v);
            var done = s.cls === 'done';
            var failed = s.cls === 'failed' || s.cls === 'overdue' || s.cls === 'current';
            return '<button class="task-card ' + s.cls + '" type="button" data-task="' + t.id + '" aria-pressed="' + done + '">' +
                '<span class="task-time">' + t.time + '</span>' +
                '<span class="task-dot"></span>' +
                '<span class="task-main"><span class="task-title">' + escapeHtml(t.title) + '</span>' +
                '<span class="task-desc">' + escapeHtml(t.desc) + '</span></span>' +
                '<span class="badge ' + s.cls + '">' + s.label + '</span>' +
                '<span class="check' + (failed ? ' fail' : '') + '" data-fail="1" title="标记没做">' + (done ? '✓' : (failed ? '✗' : '')) + '</span>' +
                '</button>';
        }).join('');
        document.getElementById('timeline').innerHTML = html;
    }

    function renderStats(v) {
        var keys = lastNDays(7, v.info.dayKey);
        var counts = keys.map(doneCount);
        var total = counts.reduce(function (a, b) { return a + b; }, 0);
        var pct = Math.round(total / (7 * TASKS.length) * 100);

        document.getElementById('streakValue').textContent = computeStreak(v.info.dayKey);
        document.getElementById('rateValue').textContent = pct + '%';
        document.getElementById('rateRing').innerHTML = ringSvg(pct / 100, 92, 8, '#4F7CFF');
        document.getElementById('bars').innerHTML = keys.map(function (k, i) {
            var c = counts[i];
            var h = Math.max(3, Math.round(c / TASKS.length * 100));
            return '<div class="bar-col" title="' + k + '：' + c + '/' + TASKS.length + '">' +
                '<div class="bar-track"><div class="bar-fill' + (c === TASKS.length ? ' full' : '') + '" style="height:' + h + '%"></div></div>' +
                '<span class="bar-label">' + k.slice(5).replace('-', '/') + '</span></div>';
        }).join('');
    }

    function renderAll(v) {
        document.getElementById('dateLine').textContent = v.dateLine;
        document.getElementById('clock').textContent = v.clock;
        document.getElementById('dayNote').textContent = v.info.wrapped
            ? '统计日 ' + v.info.dayKey + ' · 00:00–04:00 仍归属前一天'
            : '统计日 ' + v.info.dayKey + ' · 设备本地时间';
        document.getElementById('progressText').textContent = v.done + ' / ' + v.total;
        renderHero(v);
        renderTimeline(v);
        renderStats(v);
    }

    // ---------- 提醒 ----------
    function showToast(msg) {
        var el = document.getElementById('toast');
        el.textContent = msg;
        el.classList.add('show');
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { el.classList.remove('show'); }, 7000);
    }

    function remind(title, body) {
        showToast(title + '　' + body);
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'granted') return;
        if (document.visibilityState !== 'visible') return;
        try {
            var n = new Notification(title, { body: body, tag: 'daily-reminder-' + title, icon: './icon-192.png' });
            setTimeout(function () { try { n.close(); } catch (e) {} }, 8000);
        } catch (e) { /* 部分移动端浏览器不支持构造通知，降级为界面提示 */ }
    }

    function checkNotifications(v) {
        var dk = v.info.dayKey;
        var suppress = suppressUntilNow;
        suppressUntilNow = false;
        var i, t, key;

        if (dk !== lastDayKey) {
            notified = Object.create(null);
            lastDayKey = dk;
            if (!v.info.wrapped) {
                // 页面打开时已过去的项只标记、不补弹通知
                for (i = 0; i < TASKS.length; i++) {
                    t = TASKS[i];
                    if (t.minutes <= v.info.minutes) notified[dk + ':' + t.id] = true;
                }
            }
        }

        if (!v.info.wrapped) {
            for (i = 0; i < TASKS.length; i++) {
                t = TASKS[i];
                key = dk + ':' + t.id;
                if (notified[key]) continue;
                if (isDone(dk, t.id)) { notified[key] = true; continue; }
                if (v.info.minutes >= t.minutes) {
                    notified[key] = true;
                    if (!suppress) remind('提醒：' + t.title, t.notify);
                }
            }
        } else {
            var sleep = TASKS[TASKS.length - 1];
            var deadlineKey = dk + ':sleep-deadline';
            if (!notified[deadlineKey] && v.info.minutes >= DEADLINE_MIN && !isDone(dk, sleep.id)) {
                notified[deadlineKey] = true;
                notified[dk + ':' + sleep.id] = true;
                if (!suppress) remind('已过 00:00 入睡截止', '「准备睡觉」还没打卡，现在就去睡，别再刷手机了。');
            }
        }
    }

    function updateNotifyBtn() {
        var btn = document.getElementById('notifyBtn');
        if (!('Notification' in window)) {
            btn.textContent = '通知不可用';
            btn.className = 'notify-btn off';
            btn.disabled = false;
            return;
        }
        if (Notification.permission === 'granted') {
            btn.textContent = '提醒已开启';
            btn.className = 'notify-btn on';
        } else if (Notification.permission === 'denied') {
            btn.textContent = '通知被拒绝';
            btn.className = 'notify-btn off';
        } else {
            btn.textContent = '开启提醒';
            btn.className = 'notify-btn';
        }
    }

    function onNotifyClick() {
        if (!('Notification' in window)) {
            showToast('微信等内置浏览器无法弹系统通知。请用 Safari 打开本页，点「导入日历提醒」交给系统日历到点推送。');
            return;
        }
        if (Notification.permission === 'default') {
            var result = Notification.requestPermission(function () { updateNotifyBtn(); });
            if (result && typeof result.then === 'function') {
                result.then(updateNotifyBtn).catch(updateNotifyBtn);
            }
        } else {
            showToast(Notification.permission === 'granted'
                ? '提醒已开启，到点会弹出通知'
                : '通知被拒绝，可在浏览器站点设置中重新开启');
        }
    }

    // ---------- 时钟循环 ----------
    function tick() {
        view = computeView(Date.now());
        var sig = [view.info.dayKey, view.done, view.focus ? view.focus.id : '-',
            view.current ? 'c' : (view.next ? 'n' : '-'), view.info.wrapped ? 'w' : 'd'].join('|');
        if (sig !== lastSignature) {
            lastSignature = sig;
            renderAll(view);
        } else {
            document.getElementById('clock').textContent = view.clock;
            document.getElementById('countdown').textContent = view.countdownText;
        }
        checkNotifications(view);
    }

    function refresh() {
        lastSignature = '';
        tick();
    }

    function onTimelineClick(e) {
        var target = e.target;
        var btn = target && target.closest ? target.closest('[data-task]') : null;
        if (!btn || !view) return;
        var id = btn.getAttribute('data-task');
        var onCheck = !!(target.closest && target.closest('[data-fail]'));
        if (onCheck) toggleFail(view.info.dayKey, id);
        else toggleTask(view.info.dayKey, id);
        refresh();
    }

    function onHeroClick() {
        if (!view || !view.focus) return;
        toggleTask(view.info.dayKey, view.focus.id);
        refresh();
    }

    // ---------- 启动 ----------
    document.addEventListener('DOMContentLoaded', function () {
        document.getElementById('timeline').addEventListener('click', onTimelineClick);
        document.getElementById('heroAction').addEventListener('click', onHeroClick);
        document.getElementById('notifyBtn').addEventListener('click', onNotifyClick);

        var navs = document.querySelectorAll('.nav-item');
        for (var i = 0; i < navs.length; i++) {
            navs[i].addEventListener('click', (function (el) {
                return function () {
                    for (var j = 0; j < navs.length; j++) navs[j].classList.remove('active');
                    el.classList.add('active');
                };
            })(navs[i]));
        }

        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'visible') suppressUntilNow = true;
        });

        updateNotifyBtn();
        tick();
        setInterval(tick, 1000);

        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function () {
                navigator.serviceWorker.register('./sw.js').catch(function () {});
            });
        }
    });
})();
