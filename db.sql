create schema inventories collate utf8mb4_general_ci;
use inventories;

create table categories
(
    id          int auto_increment
        primary key,
    name       varchar(255) not null,
    description text         null
);

create table locations
(
    id          int auto_increment
        primary key,
    name       varchar(255) not null,
    description text         null
);

create table items
(
    id          int auto_increment
        primary key,
    category_id int                                not null,
    location_id int                                not null,
    name       varchar(255)                       not null,
    description text                               null,
    image       varchar(255)                       null,
    created_at  datetime default CURRENT_TIMESTAMP null,
    constraint items_categories_id_fk
        foreign key (category_id) references categories (id),
    constraint items_locations_id_fk
        foreign key (location_id) references locations (id)
);

insert into inventories.categories (id, name, description)
values  (1, 'Мебель', 'Мебель для офисов и рабочих зон.'),
        (2, 'Компьютерное оборудование', 'Устройства и аксессуары для работы с компьютерами.'),
        (3, 'Бытовая техника', 'Электрические приборы для офиса.');


insert into inventories.locations (id, name, description)
values  (1, 'Кабинет директора', 'Основное рабочее пространство директора.'),
        (2, 'Офис 204', 'Офис сотрудников.'),
        (3, 'Учительская', 'Комната для учителей.');

insert into inventories.items (id, category_id, location_id, name, description, image, created_at)
values  (1, 2, 1, 'Ноутбук HP Probook 450', 'Компьютер для работы с документацией и интернетом.', null, '2024-08-22 00:23:24'),
        (2, 1, 2, 'Кресло компьютерное KK-345', 'Эргономичное кресло для работы за компьютером.', null, '2024-08-22 00:23:24'),
        (3, 3, 3, 'Холодильник LG GR-B247SL', 'Холодильник для хранения продуктов в комнате отдыха.', null, '2024-08-22 00:23:24');