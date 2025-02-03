const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const { readData, writeData } = require('./data');

const app = express();
const port = 3000;

app.use(cors());
app.use('/api/icons', express.static(path.join(__dirname, 'icons')));
app.use(bodyParser.json({ limit: '20mb' }));

// 创建 icons 文件夹
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
}

const faviconCache = {};

// 获取 favicon 并保存
async function fetchAndSaveFavicon(url) {
    try {
        const hostname = new URL(url).hostname;
        if (faviconCache[hostname]) {
            console.log(`Favicon found in cache for ${hostname}`);
            return faviconCache[hostname];
        }

        const faviconUrl = new URL('/favicon.ico', url).href;
        console.log('faviconUrl', faviconUrl);
        const response = await fetch(faviconUrl, { timeout: 5000 });
        if (response.ok && response.headers.get('content-type')?.includes('image')) {
            const buffer = await response.buffer();
            const hostname = new URL(url).hostname;
            const filename = `${hostname}.ico`;
            const filePath = path.join(iconsDir, filename);
            if (fs.existsSync(filePath)) {
                console.log(`Favicon already exists for ${url}`);
                return `/icons/${filename}`;
            }
            console.log(`Saving favicon for ${url}`);
            fs.writeFileSync(filePath, buffer);
            return `/icons/${filename}`;
        }
        console.log(`Favicon not found for ${url}`);
        return null;
    } catch (error) {
        console.error('Error fetching favicon:', error);
        return null;
    }
}

// 获取 favicon
app.get('/api/favicon', async (req, res) => {
    const { url } = req.query;
    console.log('url1', url);
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }
    const iconPath = await fetchAndSaveFavicon(url);
    if (iconPath) {
        res.json({ iconPath });
    } else {
        res.status(404).json({ error: 'Favicon not found' });
    }
});

// 获取所有网站
app.get('/api/websites', (req, res) => {
    try {
        const { websites } = readData();
        res.json(websites);
    } catch (error) {
        console.error('Error getting websites:', error);
        res.status(500).json({ error: 'Failed to get websites' });
    }
});

// 获取所有分组
app.get('/api/groups', (req, res) => {
    try {
        const { groups } = readData();
        res.json(groups);
    } catch (error) {
        console.error('Error getting groups:', error);
        res.status(500).json({ error: 'Failed to get groups' });
    }
});

// 获取分组排序
app.get('/api/order', (req, res) => {
    try {
        const { order } = readData();
        res.json(order);
    } catch (error) {
        console.error('Error getting order:', error);
        res.status(500).json({ error: 'Failed to get order' });
    }
});

// 替换所有数据
app.put('/api/data', (req, res) => {
    try {
        const { websites, groups, order } = req.body;
        writeData({ websites, groups, order });
        res.json({ websites, groups, order });
    } catch (error) {
        console.error('Error updating data:', error);
        res.status(500).json({ error: 'Failed to update data' });
    }
});

app.put('/api/groups/order', (req, res) => {
    const { order } = req.body;
    if (!order) {
        return res.status(400).json({ error: 'Order is required' });
    }
    const data = readData();
    data.order = order;
    writeData(data);
    res.json(data);
});

// 添加分组
app.post('/api/groups', (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Group name is required' });
        }
        const data = readData();
        const newGroup = { id: Date.now(), name };
        data.groups.push(newGroup);
        if (!data.order) {
            data.order = [];
        }
        data.order.push({ groupId: newGroup.id, sequence: data.order.length + 1 });
        writeData(data);
        res.status(201).json(newGroup);
    } catch (error) {
        console.error('Error adding group:', error);
        res.status(500).json({ error: 'Failed to add group' });
    }
});

// 添加网站
app.post('/api/websites', async (req, res) => {
    console.log('标记添加网站');
    try {
        const { groupId, name, url, description } = req.body;
         if (!name || !url || !groupId) {
            return res.status(400).json({ error: 'Website name, URL and groupId are required' });
        }
        const data = readData();
        const hostname = new URL(url).hostname;
        const iconFilename = `${hostname}.ico`;
        const newWebsite = { id: Date.now(), name, url, description, iconPath: `/icons/${iconFilename}`, groupId: parseInt(groupId) };
        data.websites.push(newWebsite);
        await fetchAndSaveFavicon(url);
        writeData(data);
        res.status(201).json(newWebsite);
    } catch (error) {
        console.error('Error adding website:', error);
        res.status(500).json({ error: 'Failed to add website' });
    }
});

// 删除网页
app.delete('/api/websites/:websiteId', async (req, res) => {
    console.log('标记删除网页');
    try {
        const { websiteId } = req.params;
        const { deleteOption, groupId } = req.query;
        const data = readData();
        const { readHistory, writeHistory } = require('./history');

        const websiteToDelete = data.websites.find(w => w.id === parseInt(websiteId) && w.groupId === parseInt(groupId));

        if (!websiteToDelete) {
            return res.status(404).json({ error: 'Website not found' });
        }

        const iconPath = websiteToDelete.iconPath;
        if (deleteOption === 'moveToTrash') {
            const historyData = `${websiteToDelete.name}+${websiteToDelete.url}+${websiteToDelete.description}`;
            let existingHistory = readHistory();
            const updatedHistory = [...existingHistory, historyData];
            writeHistory(updatedHistory);

            data.websites = data.websites.filter(w => w.id !== parseInt(websiteId) || w.groupId !== parseInt(groupId));
            writeData(data);
        } else {
            data.websites = data.websites.filter(w => w.id !== parseInt(websiteId) || w.groupId !== parseInt(groupId));
            writeData(data);
        }
        const shouldDeleteIcon = (hostname) => {
            const data = readData();
            return !data.websites.some(website => new URL(website.url).hostname === hostname);
        };
        if (iconPath) {
            const iconFile = path.join(__dirname, iconPath);
            const hostname = new URL(websiteToDelete.url).hostname;
            if (shouldDeleteIcon(hostname) && fs.existsSync(iconFile)) {
                fs.unlinkSync(iconFile);
            }
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting website:', error);
        res.status(500).json({ error: 'Failed to delete website' });
    }
});

// 删除分组
app.delete('/api/groups/:groupId', (req, res) => {
    console.log('标记1删除分组');
    try {
        const { groupId } = req.params;
        let { deleteOption } = req.query;
        const data = readData();
        const { readHistory, writeHistory } = require('./history');

        if (!deleteOption) {
            return res.status(400).json({ error: 'Delete option is required' });
        }

        if (deleteOption === 'permanentDelete') {
            data.groups = data.groups.filter(g => g.id !== parseInt(groupId));
            data.websites = data.websites.filter(w => w.groupId !== parseInt(groupId));
            data.order = data.order.filter(item => item.groupId !== parseInt(groupId)).map((item, index) => ({ ...item, sequence: index + 1 }));
            writeData(data);
        } else if (deleteOption === 'moveToTrash') {
            const deletedWebsites = data.websites.filter(w => w.groupId === parseInt(groupId));
            const historyData = [];
            deletedWebsites.forEach(website => {
                historyData.push(`${website.name}+${website.url}+${website.description}`);
            });

            let existingHistory = readHistory();
            const updatedHistory = [...existingHistory, ...historyData];
            writeHistory(updatedHistory);

            data.groups = data.groups.filter(g => g.id !== parseInt(groupId));
            data.websites = data.websites.filter(w => w.groupId !== parseInt(groupId));
            data.order = data.order.filter(item => item.groupId !== parseInt(groupId)).map((item, index) => ({ ...item, sequence: index + 1 }));
            writeData(data);
        }
         else {
            return res.status(400).json({ error: 'Invalid delete option' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ error: 'Failed to delete group' });
    }
});

// 删除网页
app.delete('/api/groups/:groupId/websites/:websiteId', (req, res) => {
    console.log('标记删除网页');
    try {
        const { groupId, websiteId } = req.params;
        const data = readData();
        data.websites = data.websites.filter(w => w.id !== parseInt(websiteId) || w.groupId !== parseInt(groupId));
        writeData(data);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting website:', error);
        res.status(500).json({ error: 'Failed to delete website' });
    }
});

// 修改网页
app.put('/api/websites/:websiteId', (req, res) => {
    console.log('标记修改网页');
    try {
        const { websiteId } = req.params;
        const { groupId, name, url, description, iconPath } = req.body;
        if (!name || !url || !groupId) {
            return res.status(400).json({ error: 'Website name, URL and groupId are required' });
        }
        const data = readData();
        const website = data.websites.find(w => w.id === parseInt(websiteId) && w.groupId === parseInt(groupId));
         if (!website) {
            return res.status(404).json({ error: 'Website not found' });
        }
        website.name = name;
        website.url = url;
        website.description = description;
        if (iconPath) {
            website.iconPath = iconPath;
        }
        writeData(data);
        res.json(website);
    } catch (error) {
        console.error('Error updating website:', error);
        res.status(500).json({ error: 'Failed to update website' });
    }
});

// 修改分组
app.put('/api/groups/:groupId', (req, res) => {
    console.log('标记修改分组');
    try {
        const { groupId } = req.params;
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Group name is required' });
        }
        const data = readData();
        const group = data.groups.find(g => g.id === parseInt(groupId));
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        group.name = name;
        writeData(data);
        res.json(group);
    } catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({ error: 'Failed to update group' });
    }
});

app.use('/icons', express.static(path.join(__dirname, 'icons')));
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
}); 